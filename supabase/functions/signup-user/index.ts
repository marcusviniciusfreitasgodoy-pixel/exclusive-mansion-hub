import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders, sanitizeInput, isValidEmail } from "../_shared/security.ts";

interface SignupRequest {
  email: string;
  password: string;
  role: 'construtora' | 'imobiliaria';
  profile: {
    nome_empresa: string;
    cnpj?: string;
    creci?: string;
    telefone?: string;
    email_contato?: string;
  };
}

// Controlled error response - always HTTP 200 so frontend can read the payload
function controlledError(code: string, message: string) {
  return new Response(
    JSON.stringify({ success: false, code, message }),
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

// Success response
function successResponse(data: Record<string, unknown>) {
  return new Response(
    JSON.stringify({ success: true, ...data }),
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: SignupRequest = await req.json();
    const { email, password, role, profile } = body;

    // Validate inputs
    if (!email || !isValidEmail(email)) {
      return controlledError("validation_error", "E-mail inválido");
    }

    if (!password || password.length < 6) {
      return controlledError("validation_error", "Senha deve ter pelo menos 6 caracteres");
    }

    if (!role || !['construtora', 'imobiliaria'].includes(role)) {
      return controlledError("validation_error", "Tipo de conta inválido");
    }

    if (!profile?.nome_empresa) {
      return controlledError("validation_error", "Nome da empresa é obrigatório");
    }

    if (role === 'construtora' && !profile.cnpj) {
      return controlledError("validation_error", "CNPJ é obrigatório para construtora");
    }

    if (role === 'imobiliaria' && !profile.creci) {
      return controlledError("validation_error", "CRECI é obrigatório para imobiliária");
    }

    // Create Supabase client with service role for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Create user in auth.users
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: false, // Require email confirmation
    });

    if (authError) {
      console.error("Auth error:", authError);
      if (authError.message.includes("already been registered") || authError.code === "email_exists") {
        return controlledError("email_exists", "Este e-mail já está cadastrado. Faça login ou recupere sua senha.");
      }
      return controlledError("validation_error", authError.message);
    }

    if (!authData.user) {
      return controlledError("internal_error", "Falha ao criar usuário");
    }

    const userId = authData.user.id;

    // Insert user role using service role (bypasses RLS)
    const { error: roleError } = await supabaseAdmin
      .from('user_roles')
      .insert({ user_id: userId, role });

    if (roleError) {
      console.error("Role insert error:", roleError);
      // Rollback: delete the created user
      await supabaseAdmin.auth.admin.deleteUser(userId);
      return controlledError("internal_error", "Erro ao configurar permissões");
    }

    // Insert profile based on role
    if (role === 'construtora') {
      const { error: profileError } = await supabaseAdmin
        .from('construtoras')
        .insert({
          user_id: userId,
          nome_empresa: sanitizeInput(profile.nome_empresa, 200),
          cnpj: profile.cnpj?.replace(/\D/g, '') || '',
        });

      if (profileError) {
        console.error("Construtora insert error:", profileError);
        // Rollback
        await supabaseAdmin.from('user_roles').delete().eq('user_id', userId);
        await supabaseAdmin.auth.admin.deleteUser(userId);
        
        if (profileError.message.includes("duplicate key") && profileError.message.includes("cnpj")) {
          return controlledError("cnpj_exists", "Este CNPJ já está cadastrado.");
        }
        return controlledError("internal_error", "Erro ao criar perfil da construtora");
      }
    } else if (role === 'imobiliaria') {
      const { data: imobData, error: profileError } = await supabaseAdmin
        .from('imobiliarias')
        .insert({
          user_id: userId,
          nome_empresa: sanitizeInput(profile.nome_empresa, 200),
          creci: sanitizeInput(profile.creci || '', 50),
          telefone: sanitizeInput(profile.telefone || '', 20),
          email_contato: profile.email_contato || null,
        })
        .select('id')
        .single();

      if (profileError) {
        console.error("Imobiliaria insert error:", profileError);
        // Rollback
        await supabaseAdmin.from('user_roles').delete().eq('user_id', userId);
        await supabaseAdmin.auth.admin.deleteUser(userId);
        
        if (profileError.message.includes("duplicate key") && profileError.message.includes("creci")) {
          return controlledError("creci_exists", "Este CRECI já está cadastrado.");
        }
        return controlledError("internal_error", "Erro ao criar perfil da imobiliária");
      }

      // Create default form configurations if imobiliaria was created
      if (imobData?.id) {
        const defaultForms = [
          { tipo_formulario: 'contato', nome_formulario: 'Formulário de Contato' },
          { tipo_formulario: 'agendamento', nome_formulario: 'Agendamento de Visita' },
          { tipo_formulario: 'feedback_cliente', nome_formulario: 'Feedback do Cliente' },
          { tipo_formulario: 'feedback_corretor', nome_formulario: 'Feedback do Corretor' },
        ];

        for (const form of defaultForms) {
          await supabaseAdmin
            .from('configuracoes_formularios')
            .insert({
              imobiliaria_id: imobData.id,
              tipo_formulario: form.tipo_formulario,
              nome_formulario: form.nome_formulario,
              campos: [],
              created_by: userId,
            });
        }
      }
    }

    // Send confirmation email (Supabase handles this automatically for signUp, but we used admin.createUser)
    // We need to manually trigger email confirmation
    const { error: emailError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'signup',
      email,
      options: {
        redirectTo: Deno.env.get("SUPABASE_URL")?.replace('.supabase.co', '.supabase.co') + '/auth/v1/callback',
      }
    });

    if (emailError) {
      console.error("Email confirmation error:", emailError);
      // Not critical - user can request new confirmation email
    }

    return successResponse({
      message: "Conta criada com sucesso! Verifique seu e-mail para confirmar o cadastro.",
      userId,
    });

  } catch (error) {
    console.error("Signup error:", error);
    return controlledError("internal_error", "Erro interno do servidor. Tente novamente.");
  }
});
