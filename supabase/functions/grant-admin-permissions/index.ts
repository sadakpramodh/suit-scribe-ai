import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const ADMIN_EMAIL = 'sadakpramodh_maduru@welspun.com';

const ALL_PERMISSIONS = [
  'add_dispute',
  'delete_dispute',
  'upload_excel_litigation',
  'add_users',
  'delete_users',
  'export_reports',
];

Deno.serve(async (req) => {
  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;

    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Check if user is the admin
    if (user.email === ADMIN_EMAIL) {
      // Approve admin user automatically
      await supabaseClient
        .from('profiles')
        .update({ approved: true })
        .eq('id', user.id);

      // Check existing permissions
      const { data: existingPerms } = await supabaseClient
        .from('user_permissions')
        .select('permission')
        .eq('user_id', user.id);

      const existingPermissions = existingPerms?.map(p => p.permission) || [];
      const missingPermissions = ALL_PERMISSIONS.filter(
        p => !existingPermissions.includes(p)
      );

      // Grant missing permissions
      if (missingPermissions.length > 0) {
        const permissionsToInsert = missingPermissions.map(permission => ({
          user_id: user.id,
          permission,
          granted_by: user.id,
        }));

        await supabaseClient
          .from('user_permissions')
          .insert(permissionsToInsert);

        return new Response(
          JSON.stringify({
            message: 'Admin permissions granted and approved',
            granted: missingPermissions,
          }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      return new Response(
        JSON.stringify({ message: 'Admin already has all permissions and is approved' }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({ message: 'Not admin user' }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
