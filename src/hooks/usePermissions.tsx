import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type Permission = 
  | "add_dispute"
  | "delete_dispute"
  | "upload_excel_litigation"
  | "add_users"
  | "delete_users"
  | "export_reports";

export const usePermissions = () => {
  const queryClient = useQueryClient();

  const { data: permissions = [], isLoading } = useQuery({
    queryKey: ["user-permissions"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("user_permissions")
        .select("permission")
        .eq("user_id", user.id);

      if (error) throw error;
      return data.map(p => p.permission as Permission);
    },
  });

  const hasPermission = (permission: Permission): boolean => {
    return permissions.includes(permission);
  };

  const isAdmin = (): boolean => {
    return hasPermission("add_users") && hasPermission("delete_users");
  };

  return {
    permissions,
    hasPermission,
    isAdmin,
    isLoading,
  };
};

interface User {
  id: string;
  email: string;
  full_name?: string;
  permissions: Permission[];
}

export const useAdminUsers = () => {
  const queryClient = useQueryClient();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      // Get all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, full_name");

      if (profilesError) throw profilesError;

      // Get all users' permissions
      const { data: perms, error: permsError } = await supabase
        .from("user_permissions")
        .select("user_id, permission");

      if (permsError) throw permsError;

      // Get user emails from auth (this requires proper RLS setup)
      const usersWithData: User[] = await Promise.all(
        profiles.map(async (profile) => {
          const { data: { user } } = await supabase.auth.admin.getUserById(profile.id);
          
          const userPerms = perms
            .filter(p => p.user_id === profile.id)
            .map(p => p.permission as Permission);

          return {
            id: profile.id,
            email: user?.email || "unknown",
            full_name: profile.full_name || undefined,
            permissions: userPerms,
          };
        })
      );

      return usersWithData;
    },
  });

  const grantPermission = useMutation({
    mutationFn: async ({ userId, permission }: { userId: string; permission: Permission }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from("user_permissions")
        .insert({
          user_id: userId,
          permission,
          granted_by: user?.id,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("Permission granted successfully");
    },
    onError: (error: any) => {
      console.error("Error granting permission:", error);
      toast.error(error.message || "Failed to grant permission");
    },
  });

  const revokePermission = useMutation({
    mutationFn: async ({ userId, permission }: { userId: string; permission: Permission }) => {
      const { error } = await supabase
        .from("user_permissions")
        .delete()
        .eq("user_id", userId)
        .eq("permission", permission);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("Permission revoked successfully");
    },
    onError: (error: any) => {
      console.error("Error revoking permission:", error);
      toast.error(error.message || "Failed to revoke permission");
    },
  });

  return {
    users,
    isLoading,
    grantPermission,
    revokePermission,
  };
};
