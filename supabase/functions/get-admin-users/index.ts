import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client with service role key
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Verify the caller is authenticated
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);

    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user is admin
    const { data: isAdmin, error: adminCheckError } = await supabaseClient
      .rpc('is_admin', { _user_id: user.id });

    if (adminCheckError) {
      console.error('Admin check error:', adminCheckError);
      return new Response(
        JSON.stringify({ error: 'Failed to verify admin status' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!isAdmin) {
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch all profiles
    const { data: profiles, error: profilesError } = await supabaseClient
      .from('profiles')
      .select('id, full_name');

    if (profilesError) {
      console.error('Profiles fetch error:', profilesError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch profiles' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch all permissions
    const { data: permissions, error: permsError } = await supabaseClient
      .from('user_permissions')
      .select('user_id, permission');

    if (permsError) {
      console.error('Permissions fetch error:', permsError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch permissions' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch user emails using admin API
    const usersWithData = await Promise.all(
      profiles.map(async (profile) => {
        try {
          const { data: { user: authUser }, error: userError } = await supabaseClient.auth.admin.getUserById(profile.id);
          
          if (userError) {
            console.error(`Error fetching user ${profile.id}:`, userError);
            return null;
          }

          const userPerms = permissions
            .filter(p => p.user_id === profile.id)
            .map(p => p.permission);

          return {
            id: profile.id,
            email: authUser?.email || 'unknown',
            full_name: profile.full_name || undefined,
            permissions: userPerms,
          };
        } catch (error) {
          console.error(`Exception fetching user ${profile.id}:`, error);
          return null;
        }
      })
    );

    // Filter out any null results from failed fetches
    const validUsers = usersWithData.filter(user => user !== null);

    return new Response(
      JSON.stringify({ users: validUsers }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Unexpected error in get-admin-users:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
