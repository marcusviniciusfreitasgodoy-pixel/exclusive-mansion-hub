import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders, errorResponse, successResponse, isValidEmail, sanitizeInput } from "../_shared/security.ts";

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
      return errorResponse("Email inválido", 400);
    }

    if (!password || password.length < 6) {
      return errorResponse("Senha deve ter pelo menos 6 caracteres", 400);
    }

    if (!role || !['construtora', 'imobiliaria'].includes(role)) {
      return errorResponse("Role inválido", 400);
    }

    if (!profile?.nome_empresa) {
      return errorResponse("Nome da empresa é obrigatório", 400);
    }

    if (role === 'construtora' && !profile.cnpj) {
      return errorResponse("CNPJ é obrigatório para construtora", 400);
    }

    if (role === 'imobiliaria' && !profile.creci) {
      return errorResponse("CRECI é obrigatório para imobiliária", 400);
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
      if (authError.message.includes("already been registered")) {
        return errorResponse("Este email já está cadastrado", 409);
      }
      return errorResponse(authError.message, 400);
    }

    if (!authData.user) {
      return errorResponse("Falha ao criar usuário", 500);
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
      return errorResponse("Erro ao configurar permissões", 500);
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
          return errorResponse("Este CNPJ já está cadastrado", 409);
        }
        return errorResponse("Erro ao criar perfil da construtora", 500);
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
          return errorResponse("Este CRECI já está cadastrado", 409);
        }
        return errorResponse("Erro ao criar perfil da imobiliária", 500);
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
      success: true,
      message: "Conta criada com sucesso! Verifique seu email para confirmar o cadastro.",
      userId,
    });

  } catch (error) {
    console.error("Signup error:", error);
    return errorResponse("Erro interno do servidor", 500);
  }
});
