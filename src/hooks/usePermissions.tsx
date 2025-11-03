import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
  const { data: permissions = [], isLoading } = useQuery({
    queryKey: ["user-permissions"],
    queryFn: async () => {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) {
        throw authError;
      }
      if (!user) return [];

      type PermissionRow = { permission: string };

      const { data, error } = await supabase
        .from("user_permissions")
        .select("permission")
        .eq("user_id", user.id)
        .returns<PermissionRow[]>();

      if (error) throw error;
      const isPermission = (value: string): value is Permission =>
        [
          "add_dispute",
          "delete_dispute",
          "upload_excel_litigation",
          "add_users",
          "delete_users",
          "export_reports",
        ].includes(value as Permission);

      const records = data ?? [];

      return records
        .map((record) => record.permission)
        .filter((permission): permission is Permission => isPermission(permission));
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
  approved?: boolean;
}

export const useAdminUsers = () => {
  const queryClient = useQueryClient();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        throw sessionError;
      }

      if (!session) {
        throw new Error("No active session");
      }

      type AdminUsersResponse = {
        users: User[];
        error?: string;
      };

      // Call edge function to fetch users securely
      const { data, error } = await supabase.functions.invoke<AdminUsersResponse>("get-admin-users", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error("Error fetching admin users:", error);
        throw error;
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      return data?.users ?? [];
    },
  });

  const grantPermission = useMutation({
    mutationFn: async ({ userId, permission }: { userId: string; permission: Permission }) => {
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError) {
        throw authError;
      }

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
    onError: (error: unknown) => {
      console.error("Error granting permission:", error);
      const message =
        error instanceof Error ? error.message : "Failed to grant permission";
      toast.error(message);
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
    onError: (error: unknown) => {
      console.error("Error revoking permission:", error);
      const message =
        error instanceof Error ? error.message : "Failed to revoke permission";
      toast.error(message);
    },
  });

  const toggleUserApproval = useMutation({
    mutationFn: async ({ userId, approved }: { userId: string; approved: boolean }) => {
      const { error } = await supabase
        .from("profiles")
        .update({ approved })
        .eq("id", userId);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success(variables.approved ? "User approved successfully" : "User access disabled");
    },
    onError: (error: unknown) => {
      console.error("Error updating user approval:", error);
      const message =
        error instanceof Error ? error.message : "Failed to update user approval";
      toast.error(message);
    },
  });

  return {
    users,
    isLoading,
    grantPermission,
    revokePermission,
    toggleUserApproval,
  };
};
