import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";
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

// Send confirmation email using Resend
async function sendConfirmationEmail(
  resend: Resend,
  email: string,
  confirmationUrl: string,
  nomeEmpresa: string,
  role: string
): Promise<boolean> {
  const roleLabel = role === 'construtora' ? 'Construtora' : 'Imobiliária';
  
  try {
    const { error } = await resend.emails.send({
      from: "Godoy Prime <noreply@godoyprime.com.br>",
      to: [email],
      subject: `Confirme seu cadastro - ${roleLabel}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4;">
          <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
            <tr>
              <td style="background: linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%); padding: 40px 30px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">Godoy Prime</h1>
                <p style="color: #b8860b; margin: 10px 0 0 0; font-size: 14px; letter-spacing: 1px;">IMÓVEIS DE ALTO PADRÃO</p>
              </td>
            </tr>
            <tr>
              <td style="padding: 40px 30px;">
                <h2 style="color: #1e3a5f; margin: 0 0 20px 0; font-size: 24px;">Bem-vindo(a), ${sanitizeInput(nomeEmpresa, 100)}!</h2>
                <p style="color: #555555; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                  Obrigado por se cadastrar como <strong>${roleLabel}</strong> em nossa plataforma.
                </p>
                <p style="color: #555555; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                  Para ativar sua conta e começar a usar todos os recursos, clique no botão abaixo:
                </p>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${confirmationUrl}" 
                     style="display: inline-block; background: linear-gradient(135deg, #b8860b 0%, #d4a84b 100%); color: #ffffff; text-decoration: none; padding: 15px 40px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 15px rgba(184, 134, 11, 0.3);">
                    Confirmar Meu E-mail
                  </a>
                </div>
                <p style="color: #888888; font-size: 14px; line-height: 1.6; margin: 30px 0 0 0;">
                  Se o botão não funcionar, copie e cole o link abaixo no seu navegador:
                </p>
                <p style="color: #1e3a5f; font-size: 12px; word-break: break-all; background-color: #f8f9fa; padding: 15px; border-radius: 4px; margin: 10px 0 0 0;">
                  ${confirmationUrl}
                </p>
              </td>
            </tr>
            <tr>
              <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
                <p style="color: #888888; font-size: 12px; margin: 0;">
                  Este link expira em 24 horas. Se você não solicitou este cadastro, ignore este e-mail.
                </p>
                <p style="color: #aaaaaa; font-size: 11px; margin: 15px 0 0 0;">
                  © ${new Date().getFullYear()} Godoy Prime. Todos os direitos reservados.
                </p>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      return false;
    }
    return true;
  } catch (error) {
    console.error("Email sending error:", error);
    return false;
  }
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

    // Initialize Resend
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.error("RESEND_API_KEY not configured");
      return controlledError("internal_error", "Serviço de e-mail não configurado");
    }
    const resend = new Resend(resendApiKey);

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

    // Generate confirmation link and send email via Resend
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'signup',
      email,
      options: {
        redirectTo: `${Deno.env.get("SUPABASE_URL")}/auth/v1/callback`,
      }
    });

    if (linkError || !linkData?.properties?.action_link) {
      console.error("Link generation error:", linkError);
      // User is created but email not sent - still return success with warning
      return successResponse({
        message: "Conta criada! Houve um problema ao enviar o e-mail de confirmação. Entre em contato com o suporte.",
        userId,
        emailSent: false,
      });
    }

    // Send confirmation email using Resend
    const emailSent = await sendConfirmationEmail(
      resend,
      email,
      linkData.properties.action_link,
      profile.nome_empresa,
      role
    );

    if (!emailSent) {
      console.error("Failed to send confirmation email");
      return successResponse({
        message: "Conta criada! Houve um problema ao enviar o e-mail de confirmação. Entre em contato com o suporte.",
        userId,
        emailSent: false,
      });
    }

    console.log("User created and confirmation email sent:", email);

    return successResponse({
      message: "Conta criada com sucesso! Verifique seu e-mail para confirmar o cadastro.",
      userId,
      emailSent: true,
    });

  } catch (error) {
    console.error("Signup error:", error);
    return controlledError("internal_error", "Erro interno do servidor. Tente novamente.");
  }
});