import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.3/+esm";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface InviteTeacherRequest {
  email: string;
  fullName: string;
  invitedBy: string;
}

const generateTempPassword = (): string => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  let password = "";
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, fullName, invitedBy }: InviteTeacherRequest = await req.json();

    console.log(`Inviting teacher: ${email}`);

    // Create Supabase client with service role
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Generate temporary password
    const tempPassword = generateTempPassword();

    // Create the user account
    const { data: userData, error: createError } = await supabase.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        role: 'teacher',
        requires_onboarding: true,
      },
    });

    if (createError) {
      console.error("Error creating user:", createError);
      throw new Error(`Failed to create user: ${createError.message}`);
    }

    console.log(`User created: ${userData.user.id}`);

    // Create teacher profile
    const { error: profileError } = await supabase
      .from('teacher_profiles')
      .insert({
        user_id: userData.user.id,
      });

    if (profileError) {
      console.error("Error creating teacher profile:", profileError);
      throw new Error(`Failed to create teacher profile: ${profileError.message}`);
    }

    // Assign teacher role
    const { error: roleError } = await supabase
      .from('user_roles')
      .insert({
        user_id: userData.user.id,
        role: 'teacher',
      });

    if (roleError) {
      console.error("Error assigning role:", roleError);
      throw new Error(`Failed to assign teacher role: ${roleError.message}`);
    }

    // Send invitation email
    const loginUrl = `${supabaseUrl.replace('https://irxzpsvzlihqitlicoql.supabase.co', 'https://id-preview--6ba0ffd1-9a8e-49f9-9f63-94f86000b68b.lovable.app')}/teacher/auth`;
    
    const emailResponse = await resend.emails.send({
      from: "Full STEM <onboarding@resend.dev>",
      to: [email],
      subject: "Welcome to Full STEM - Teacher Account Created",
      html: `
        <h1>Welcome to Full STEM, ${fullName}!</h1>
        <p>Your teacher account has been created. Please use the following credentials to sign in:</p>
        
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Temporary Password:</strong> <code style="background-color: #fff; padding: 5px 10px; border-radius: 3px;">${tempPassword}</code></p>
        </div>

        <p>Please sign in and complete your profile setup:</p>
        <a href="${loginUrl}" style="display: inline-block; background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0;">Sign In to Full STEM</a>
        
        <p style="margin-top: 20px; color: #666; font-size: 14px;">
          <strong>Important:</strong> Please change your password after your first login for security.
        </p>
        
        <p style="margin-top: 20px;">
          If you have any questions, please contact your school administrator.
        </p>
        
        <p>Best regards,<br>The Full STEM Team</p>
      `,
    });

    console.log("Email sent:", emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        userId: userData.user.id,
        message: "Teacher invitation sent successfully" 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in invite-teacher function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
