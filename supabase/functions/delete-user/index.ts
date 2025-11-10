import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DeleteUserRequest {
  userIdToDelete: string;
  reassignToUserId?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);

    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    // Check if requesting user is admin
    const { data: isAdmin } = await supabaseClient.rpc('is_admin', {
      _user_id: user.id,
    });

    if (!isAdmin) {
      throw new Error('Only admins can delete users');
    }

    const { userIdToDelete, reassignToUserId }: DeleteUserRequest = await req.json();

    console.log('Deleting user:', userIdToDelete, 'Reassigning to:', reassignToUserId);

    // If reassignment is requested, update all cases and disputes
    if (reassignToUserId) {
      // Update disputes
      const { error: disputesError } = await supabaseClient
        .from('disputes')
        .update({ user_id: reassignToUserId })
        .eq('user_id', userIdToDelete);

      if (disputesError) {
        console.error('Error updating disputes:', disputesError);
        throw new Error('Failed to reassign disputes');
      }

      // Update litigation cases
      const { error: casesError } = await supabaseClient
        .from('litigation_cases')
        .update({ user_id: reassignToUserId })
        .eq('user_id', userIdToDelete);

      if (casesError) {
        console.error('Error updating litigation cases:', casesError);
        throw new Error('Failed to reassign litigation cases');
      }

      console.log('Successfully reassigned cases and disputes');
    }

    // Delete the user using admin API
    const { error: deleteError } = await supabaseClient.auth.admin.deleteUser(
      userIdToDelete
    );

    if (deleteError) {
      console.error('Error deleting user:', deleteError);
      throw new Error('Failed to delete user');
    }

    console.log('User deleted successfully');

    return new Response(
      JSON.stringify({ success: true, message: 'User deleted successfully' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in delete-user function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
