import { format } from "date-fns";
import {
  FileText,
  Gavel,
  Scale,
  Calendar,
  Plus,
  CheckCircle2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { LitigationCase } from "@/hooks/useLitigationCases";
import type { TimelineEvent } from "@/hooks/useTimelineEvents";
import { useTimelineEvents } from "@/hooks/useTimelineEvents";
import { useState } from "react";
import { AddTimelineEventDialog } from "./AddTimelineEventDialog";

interface LitigationTimelineDialogProps {
  litigationCase: LitigationCase | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const getStageIcon = (stageType: string) => {
  switch (stageType) {
    case "filed":
      return <FileText className="h-5 w-5" />;
    case "hearing":
      return <Gavel className="h-5 w-5" />;
    case "judgment":
      return <Scale className="h-5 w-5" />;
    case "appeal":
      return <Calendar className="h-5 w-5" />;
    default:
      return <CheckCircle2 className="h-5 w-5" />;
  }
};

const getStageColor = (stageType: string) => {
  switch (stageType) {
    case "filed":
      return "bg-primary text-primary-foreground";
    case "hearing":
      return "bg-accent text-accent-foreground";
    case "judgment":
      return "bg-success text-success-foreground";
    case "appeal":
      return "bg-warning text-warning-foreground";
    default:
      return "bg-muted text-muted-foreground";
  }
};

export default function LitigationTimelineDialog({
  litigationCase,
  open,
  onOpenChange,
}: LitigationTimelineDialogProps) {
  const { events, loading } = useTimelineEvents(litigationCase?.id ?? null);
  const [addEventOpen, setAddEventOpen] = useState(false);

  if (!litigationCase) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <Scale className="h-6 w-6 text-primary" />
              Case Timeline
            </DialogTitle>
            <DialogDescription>
              Track the progress of {litigationCase.parties} at {litigationCase.forum}
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center justify-between mb-4">
            <Badge variant="outline" className="text-sm">
              {litigationCase.status}
            </Badge>
            <Button
              onClick={() => setAddEventOpen(true)}
              size="sm"
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Event
            </Button>
          </div>

          <ScrollArea className="max-h-[500px] pr-4">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading timeline...
              </div>
            ) : events.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Scale className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No timeline events yet</p>
                <p className="text-sm mt-2">Add events to track case progress</p>
              </div>
            ) : (
              <div className="relative">
                {/* Vertical timeline line */}
                <div className="absolute left-[27px] top-8 bottom-8 w-0.5 bg-border" />

                {/* Timeline events */}
                <div className="space-y-6">
                  {events.map((event, index) => (
                    <div key={event.id} className="relative flex gap-4">
                      {/* Icon circle */}
                      <div
                        className={`flex-shrink-0 w-14 h-14 rounded-full flex items-center justify-center z-10 shadow-lg ${getStageColor(
                          event.stage_type
                        )}`}
                      >
                        {getStageIcon(event.stage_type)}
                      </div>

                      {/* Content card */}
                      <div className="flex-1 pb-6">
                        <div className="bg-card border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-semibold text-lg">
                                {event.event_title}
                                {event.hearing_number && (
                                  <span className="text-muted-foreground ml-2">
                                    #{event.hearing_number}
                                  </span>
                                )}
                              </h3>
                              <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                <span>
                                  {format(new Date(event.event_date), "MMMM dd, yyyy")}
                                </span>
                              </div>
                            </div>
                            <Badge variant="secondary" className="capitalize">
                              {event.stage_type}
                            </Badge>
                          </div>

                          {event.summary && (
                            <>
                              <Separator className="my-3" />
                              <p className="text-sm text-muted-foreground leading-relaxed">
                                {event.summary}
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <AddTimelineEventDialog
        caseId={litigationCase.id}
        open={addEventOpen}
        onOpenChange={setAddEventOpen}
      />
    </>
  );
}
