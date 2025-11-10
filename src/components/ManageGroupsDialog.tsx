import { Users, Shield, UserCog, User as UserIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ManageGroupsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ROLE_GROUPS = [
  {
    role: "admin",
    icon: Shield,
    color: "text-red-500",
    bgColor: "bg-red-500/10",
    description: "Full system access with all permissions",
    permissions: [
      "Add & Delete Disputes",
      "Upload Excel Litigation",
      "Add & Delete Users",
      "Export Reports",
      "Manage Permissions",
      "View All Data",
    ],
  },
  {
    role: "legal_head",
    icon: UserCog,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    description: "Senior legal team member with extended permissions",
    permissions: [
      "Add & Delete Disputes",
      "Upload Excel Litigation",
      "Export Reports",
      "View Team Data",
      "Manage Cases",
    ],
  },
  {
    role: "legal_counsel",
    icon: Users,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    description: "Legal counsel with case management permissions",
    permissions: [
      "Add Disputes",
      "View Assigned Cases",
      "Update Case Status",
      "Add Timeline Events",
    ],
  },
  {
    role: "user",
    icon: UserIcon,
    color: "text-gray-500",
    bgColor: "bg-gray-500/10",
    description: "Basic user with view-only permissions",
    permissions: [
      "View Own Cases",
      "View Disputes",
      "View Reports",
    ],
  },
];

export default function ManageGroupsDialog({
  open,
  onOpenChange,
}: ManageGroupsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Shield className="h-6 w-6 text-primary" />
            User Groups & Roles
          </DialogTitle>
          <DialogDescription>
            Overview of system roles and their associated permissions
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="grid gap-4 md:grid-cols-2">
            {ROLE_GROUPS.map(({ role, icon: Icon, color, bgColor, description, permissions }) => (
              <Card key={role} className="border-2 hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${bgColor}`}>
                      <Icon className={`h-5 w-5 ${color}`} />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg capitalize">{role.replace('_', ' ')}</CardTitle>
                      <CardDescription className="text-xs mt-1">
                        {description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-muted-foreground">Permissions:</p>
                    <div className="space-y-1">
                      {permissions.map((permission, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <div className={`h-1.5 w-1.5 rounded-full ${bgColor}`} />
                          <span className="text-sm">{permission}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="mt-4 border-primary/20">
            <CardHeader>
              <CardTitle className="text-base">Assignment Notes</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2 text-muted-foreground">
              <p>• Roles are automatically assigned based on permissions granted</p>
              <p>• Admin users have <Badge variant="outline" className="text-xs">add_users</Badge> and <Badge variant="outline" className="text-xs">delete_users</Badge> permissions</p>
              <p>• Individual permissions can be customized per user in the main admin panel</p>
              <p>• Changes take effect immediately after saving</p>
            </CardContent>
          </Card>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
