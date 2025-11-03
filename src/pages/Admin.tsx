import { Shield, UserPlus, UserMinus, CheckCircle, XCircle, UserCheck } from "lucide-react";
import { usePermissions, useAdminUsers, Permission } from "@/hooks/usePermissions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";

const PERMISSION_LABELS: Record<Permission, string> = {
  add_dispute: "Add Dispute",
  delete_dispute: "Delete Dispute",
  upload_excel_litigation: "Upload Excel",
  add_users: "Add Users",
  delete_users: "Delete Users",
  export_reports: "Export Reports",
};

export default function Admin() {
  const { isAdmin, isLoading: permissionsLoading } = usePermissions();
  const { users, isLoading: usersLoading, grantPermission, revokePermission, toggleUserApproval } = useAdminUsers();

  if (permissionsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAdmin()) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4 text-center">
              <Shield className="h-16 w-16 text-muted-foreground" />
              <div>
                <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
                <p className="text-muted-foreground">
                  You don't have permission to access the admin panel.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleTogglePermission = (userId: string, permission: Permission, hasPermission: boolean) => {
    if (hasPermission) {
      revokePermission.mutate({ userId, permission });
    } else {
      grantPermission.mutate({ userId, permission });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Admin Panel</h1>
          <p className="mt-1 text-muted-foreground">Manage users and permissions</p>
        </div>
      </div>

      <Card className="shadow-[var(--shadow-card)]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            User Permissions Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="text-center">Approved</TableHead>
                  {Object.entries(PERMISSION_LABELS).map(([key, label]) => (
                    <TableHead key={key} className="text-center">
                      {label}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {usersLoading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      Loading users...
                    </TableCell>
                  </TableRow>
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id} className="transition-colors hover:bg-muted/50">
                      <TableCell className="font-medium">
                        {user.full_name || "Unknown"}
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <div className="flex justify-center items-center gap-2">
                          <Switch
                            checked={user.approved ?? false}
                            onCheckedChange={() => toggleUserApproval.mutate({ 
                              userId: user.id, 
                              approved: !(user.approved ?? false) 
                            })}
                          />
                          {user.approved ? (
                            <Badge variant="default" className="text-xs">Active</Badge>
                          ) : (
                            <Badge variant="destructive" className="text-xs">Pending</Badge>
                          )}
                        </div>
                      </TableCell>
                      {Object.keys(PERMISSION_LABELS).map((permission) => {
                        const hasPermission = user.permissions.includes(permission as Permission);
                        return (
                          <TableCell key={permission} className="text-center">
                            <div className="flex justify-center">
                              <Checkbox
                                checked={hasPermission}
                                onCheckedChange={() =>
                                  handleTogglePermission(
                                    user.id,
                                    permission as Permission,
                                    hasPermission
                                  )
                                }
                              />
                            </div>
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="shadow-[var(--shadow-card)]">
          <CardHeader>
            <CardTitle className="text-sm">Permission Types</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {Object.entries(PERMISSION_LABELS).map(([key, label]) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{label}</span>
                <Badge variant="outline">{key}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="shadow-[var(--shadow-card)]">
          <CardHeader>
            <CardTitle className="text-sm">Quick Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Users</span>
              <span className="font-semibold text-foreground">{users.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Admin Users</span>
              <span className="font-semibold text-foreground">
                {users.filter(u => 
                  u.permissions.includes("add_users") && 
                  u.permissions.includes("delete_users")
                ).length}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-[var(--shadow-card)]">
          <CardHeader>
            <CardTitle className="text-sm">System Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">RLS Enabled</span>
              <CheckCircle className="h-4 w-4 text-success" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Permissions</span>
              <span className="font-semibold text-foreground">Active</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
