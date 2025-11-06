import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface TimelineEvent {
  id: string;
  case_id: string;
  stage_type: "filed" | "hearing" | "judgment" | "appeal";
  event_title: string;
  event_date: string;
  summary: string | null;
  hearing_number: number | null;
  created_at: string;
  updated_at: string;
}

export type TimelineEventInsert = Omit<
  TimelineEvent,
  "id" | "created_at" | "updated_at"
>;

export const useTimelineEvents = (caseId: string | null) => {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchEvents = useCallback(async () => {
    if (!caseId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("litigation_timeline_events")
        .select("*")
        .eq("case_id", caseId)
        .order("event_date", { ascending: true })
        .returns<TimelineEvent[]>();

      if (error) throw error;

      setEvents(data ?? []);
    } catch (error: unknown) {
      console.error("Error fetching timeline events:", error);
      toast.error("Failed to load timeline events");
    } finally {
      setLoading(false);
    }
  }, [caseId]);

  const addEvent = async (eventData: TimelineEventInsert) => {
    try {
      const { data, error } = await supabase
        .from("litigation_timeline_events")
        .insert(eventData)
        .select()
        .single()
        .returns<TimelineEvent>();

      if (error) throw error;

      toast.success("Timeline event added successfully");
      void fetchEvents();
      return data;
    } catch (error: unknown) {
      console.error("Error adding timeline event:", error);
      toast.error("Failed to add timeline event");
      return null;
    }
  };

  const deleteEvent = async (id: string) => {
    try {
      const { error } = await supabase
        .from("litigation_timeline_events")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast.success("Event deleted successfully");
      setEvents((previous) => previous.filter((event) => event.id !== id));
    } catch (error: unknown) {
      console.error("Error deleting event:", error);
      toast.error("Failed to delete event");
    }
  };

  useEffect(() => {
    void fetchEvents();
  }, [fetchEvents]);

  return {
    events,
    loading,
    fetchEvents,
    addEvent,
    deleteEvent,
  };
};
