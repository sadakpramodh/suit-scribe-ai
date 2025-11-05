import { format } from "date-fns";
import { Calendar, Building2, FileText, User, DollarSign, Mail, Clock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Dispute } from "@/hooks/useDisputes";

interface DisputeDetailsDialogProps {
  dispute: Dispute | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function DisputeDetailsDialog({
  dispute,
  open,
  onOpenChange,
}: DisputeDetailsDialogProps) {
  if (!dispute) return null;

  const getStatusVariant = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      "Pending": "destructive",
      "Under Review": "secondary",
      "Response Sent": "default",
      "Closed": "outline",
    };
    return variants[status] || "default";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">Dispute Details</DialogTitle>
          <DialogDescription>
            Complete information about this pre-litigation dispute
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[600px] pr-4">
          <div className="space-y-6">
            {/* Status Badge */}
            <div className="flex items-center justify-between">
              <Badge variant={getStatusVariant(dispute.status)} className="text-sm px-3 py-1">
                {dispute.status}
              </Badge>
              <span className="text-sm text-muted-foreground">
                Created {format(new Date(dispute.created_at), "MMM dd, yyyy")}
              </span>
            </div>

            <Separator />

            {/* Company and Type */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Building2 className="h-4 w-4" />
                  <span>Company</span>
                </div>
                <p className="font-semibold text-lg">{dispute.company}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  <span>Dispute Type</span>
                </div>
                <Badge variant="outline" className="text-base px-3 py-1">
                  {dispute.dispute_type}
                </Badge>
              </div>
            </div>

            {/* Value */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <DollarSign className="h-4 w-4" />
                <span>Dispute Value</span>
              </div>
              <p className="font-bold text-2xl text-primary">₹{dispute.value} Cr</p>
            </div>

            <Separator />

            {/* Notice Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Notice Information</h3>
              
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span>Notice From</span>
                  </div>
                  <p className="font-medium">{dispute.notice_from}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Notice Date</span>
                  </div>
                  <p className="font-medium">
                    {format(new Date(dispute.notice_date), "MMMM dd, yyyy")}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Reply Due Date</span>
                </div>
                <p className="font-medium text-destructive">
                  {format(new Date(dispute.reply_due_date), "MMMM dd, yyyy")}
                </p>
              </div>
            </div>

            <Separator />

            {/* Responsible User */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span>Responsible User</span>
              </div>
              <p className="font-medium">{dispute.responsible_user}</p>
            </div>

            {/* Description */}
            {dispute.description && (
              <>
                <Separator />
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg">Description</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {dispute.description}
                  </p>
                </div>
              </>
            )}

            {/* Documents */}
            {dispute.document_paths && dispute.document_paths.length > 0 && (
              <>
                <Separator />
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg">Attached Documents</h3>
                  <div className="space-y-2">
                    {dispute.document_paths.map((path, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 p-2 rounded-md bg-muted/50"
                      >
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm truncate">{path.split("/").pop()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
