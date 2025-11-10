import { useState } from "react";
import { AlertTriangle, UserMinus, Users } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface User {
  id: string;
  email: string;
  full_name?: string;
}

interface DeleteUserDialogProps {
  user: User | null;
  allUsers: User[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (userId: string, reassignToUserId?: string) => void;
  loading?: boolean;
}

export default function DeleteUserDialog({
  user,
  allUsers,
  open,
  onOpenChange,
  onConfirm,
  loading = false,
}: DeleteUserDialogProps) {
  const [reassignToUserId, setReassignToUserId] = useState<string>("");

  if (!user) return null;

  const availableUsers = allUsers.filter((u) => u.id !== user.id);

  const handleConfirm = () => {
    onConfirm(user.id, reassignToUserId || undefined);
    setReassignToUserId("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <UserMinus className="h-5 w-5" />
            Delete User
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the user account.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              You are about to delete <strong>{user.full_name || user.email}</strong>.
              All their data will be permanently removed.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="reassign-user" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Reassign Cases & Disputes (Optional)
            </Label>
            <Select value={reassignToUserId} onValueChange={setReassignToUserId}>
              <SelectTrigger id="reassign-user">
                <SelectValue placeholder="Select user to reassign cases to..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_none">Don't reassign (delete all data)</SelectItem>
                {availableUsers.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.full_name || u.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              If selected, all disputes and litigation cases will be transferred to this user.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? "Deleting..." : "Delete User"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
