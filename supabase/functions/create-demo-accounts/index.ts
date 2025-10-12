import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DemoAccount {
  email: string;
  password: string;
  role: string;
  fullName: string;
  metadata?: Record<string, any>;
}

const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    email: 'student@test.com',
    password: 'Test1234!',
    role: 'student',
    fullName: 'Demo Student',
    metadata: { first_name: 'Demo', last_name: 'Student', grade_level: '10' }
  },
  {
    email: 'teacher@test.com',
    password: 'Test1234!',
    role: 'teacher',
    fullName: 'Demo Teacher',
    metadata: { first_name: 'Demo', last_name: 'Teacher' }
  },
  {
    email: 'parent@test.com',
    password: 'Test1234!',
    role: 'parent',
    fullName: 'Demo Parent',
    metadata: { first_name: 'Demo', last_name: 'Parent' }
  },
  {
    email: 'admin@test.com',
    password: 'Test1234!',
    role: 'admin',
    fullName: 'Demo Admin',
    metadata: { first_name: 'Demo', last_name: 'Admin' }
  },
  {
    email: 'superadmin@test.com',
    password: 'Test1234!',
    role: 'super_admin',
    fullName: 'Demo Super Admin',
    metadata: { first_name: 'Demo', last_name: 'SuperAdmin' }
  },
  {
    email: 'developer@test.com',
    password: 'Test1234!',
    role: 'developer',
    fullName: 'Demo Developer',
    metadata: { first_name: 'Demo', last_name: 'Developer' }
  }
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Demo accounts creation started');

    const results = [];

    for (const account of DEMO_ACCOUNTS) {
      try {
        console.log(`Creating account: ${account.email} with role: ${account.role}`);

        // Check if user already exists
        const { data: existingUser } = await supabase.auth.admin.listUsers();
        const userExists = existingUser?.users.find(u => u.email === account.email);

        let userId: string;

        if (userExists) {
          console.log(`User ${account.email} already exists, updating...`);
          userId = userExists.id;
          
          // Update user metadata
          await supabase.auth.admin.updateUserById(userId, {
            user_metadata: { ...account.metadata, role: account.role }
          });
        } else {
          // Create new user
          const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
            email: account.email,
            password: account.password,
            email_confirm: true,
            user_metadata: { ...account.metadata, role: account.role }
          });

          if (createError) {
            console.error(`Error creating user ${account.email}:`, createError);
            results.push({ email: account.email, status: 'error', message: createError.message });
            continue;
          }

          userId = newUser.user!.id;
          console.log(`Created user ${account.email} with ID: ${userId}`);
        }

        // Upsert profile
        await supabase.from('profiles').upsert({
          id: userId,
          email: account.email,
          full_name: account.fullName
        });

        // Upsert role
        await supabase.from('user_roles').upsert({
          user_id: userId,
          role: account.role
        }, { onConflict: 'user_id,role' });

        // Create role-specific entries
        if (account.role === 'student') {
          await supabase.from('students').upsert({
            user_id: userId,
            first_name: account.metadata?.first_name || 'Demo',
            last_name: account.metadata?.last_name || 'Student',
            grade_level: account.metadata?.grade_level || '10'
          }, { onConflict: 'user_id' });
        } else if (account.role === 'teacher' || account.role === 'admin') {
          await supabase.from('teacher_profiles').upsert({
            user_id: userId
          }, { onConflict: 'user_id' });
        } else if (account.role === 'parent') {
          await supabase.from('parent_profiles').upsert({
            user_id: userId,
            first_name: account.metadata?.first_name || 'Demo',
            last_name: account.metadata?.last_name || 'Parent'
          }, { onConflict: 'user_id' });
        }

        results.push({
          email: account.email,
          role: account.role,
          status: userExists ? 'updated' : 'created',
          userId
        });

        console.log(`Successfully processed ${account.email}`);
      } catch (error: any) {
        console.error(`Error processing ${account.email}:`, error);
        results.push({
          email: account.email,
          status: 'error',
          message: error.message
        });
      }
    }

    console.log('Demo accounts creation completed');

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Demo accounts processed successfully',
        results
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error in create-demo-accounts function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
