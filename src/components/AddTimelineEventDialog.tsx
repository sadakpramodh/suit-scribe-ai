import { useState } from "react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { useTimelineEvents } from "@/hooks/useTimelineEvents";
import { cn } from "@/lib/utils";

interface AddTimelineEventDialogProps {
  caseId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddTimelineEventDialog({
  caseId,
  open,
  onOpenChange,
}: AddTimelineEventDialogProps) {
  const { addEvent } = useTimelineEvents(caseId);
  const [loading, setLoading] = useState(false);
  const [eventTitle, setEventTitle] = useState("");
  const [stageType, setStageType] = useState<"filed" | "hearing" | "judgment" | "appeal">("hearing");
  const [eventDate, setEventDate] = useState<Date>();
  const [summary, setSummary] = useState("");
  const [hearingNumber, setHearingNumber] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventDate || !eventTitle) return;

    setLoading(true);
    const result = await addEvent({
      case_id: caseId,
      stage_type: stageType,
      event_title: eventTitle,
      event_date: format(eventDate, "yyyy-MM-dd"),
      summary: summary || null,
      hearing_number: hearingNumber ? parseInt(hearingNumber) : null,
    });

    setLoading(false);

    if (result) {
      // Reset form
      setEventTitle("");
      setStageType("hearing");
      setEventDate(undefined);
      setSummary("");
      setHearingNumber("");
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Timeline Event</DialogTitle>
          <DialogDescription>
            Record a new event in the litigation timeline
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="stage-type">Stage Type</Label>
            <Select
              value={stageType}
              onValueChange={(value: "filed" | "hearing" | "judgment" | "appeal") =>
                setStageType(value)
              }
            >
              <SelectTrigger id="stage-type">
                <SelectValue placeholder="Select stage type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="filed">Case Filed</SelectItem>
                <SelectItem value="hearing">Hearing</SelectItem>
                <SelectItem value="judgment">Judgment</SelectItem>
                <SelectItem value="appeal">Appeal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="event-title">Event Title</Label>
            <Input
              id="event-title"
              value={eventTitle}
              onChange={(e) => setEventTitle(e.target.value)}
              placeholder="e.g., First Hearing"
              required
            />
          </div>

          {stageType === "hearing" && (
            <div className="space-y-2">
              <Label htmlFor="hearing-number">Hearing Number</Label>
              <Input
                id="hearing-number"
                type="number"
                value={hearingNumber}
                onChange={(e) => setHearingNumber(e.target.value)}
                placeholder="1"
                min="1"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label>Event Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !eventDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {eventDate ? format(eventDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={eventDate}
                  onSelect={setEventDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="summary">Summary (Optional)</Label>
            <Textarea
              id="summary"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Brief description of what happened..."
              rows={4}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !eventTitle || !eventDate}>
              {loading ? "Adding..." : "Add Event"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
