import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";

export type Dispute = {
  id: string;
  user_id: string;
  company: string;
  subsidiary: string | null;
  unit: string | null;
  dispute_type: string;
  category: string | null;
  sub_category: string | null;
  department: string | null;
  description: string | null;
  value: number;
  notice_from: string;
  notice_date: string;
  receipt_date: string | null;
  reply_due_date: string;
  relief_sought: string | null;
  relevant_law: string | null;
  risk_rating: 'high' | 'medium' | 'low' | null;
  state: string | null;
  city: string | null;
  brief_facts: string | null;
  assigned_legal_officer: string | null;
  reporting_manager: string | null;
  provision_in_books: number | null;
  contingent_liability: number | null;
  company_law_firm: string | null;
  opposite_party_law_firm: string | null;
  responsible_user: string;
  status: string;
  document_paths: string[] | null;
  created_at: string;
  updated_at: string;
};

export function useDisputes() {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchDisputes = useCallback(async () => {
    if (!user) {
      setDisputes([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("disputes")
        .select("*")
        .order("created_at", { ascending: false })
        .returns<Dispute[]>();

      if (error) throw error;
      setDisputes(data ?? []);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to fetch disputes";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast, user]);

  const deleteDispute = async (id: string) => {
    try {
      const { error } = await supabase.from("disputes").delete().eq("id", id);

      if (error) throw error;

      setDisputes((previous) => previous.filter((dispute) => dispute.id !== id));
      toast({
        title: "Dispute Deleted",
        description: "The dispute has been deleted successfully.",
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to delete dispute";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    }
  };

  const updateDisputeStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from("disputes")
        .update({ status })
        .eq("id", id);

      if (error) throw error;

      setDisputes((previous) =>
        previous.map((dispute) =>
          dispute.id === id ? { ...dispute, status } : dispute
        )
      );
      toast({
        title: "Status Updated",
        description: "The dispute status has been updated successfully.",
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to update status";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (!user?.id) {
      setDisputes([]);
      setLoading(false);
      return;
    }

    void fetchDisputes();

    // Listen for dispute creation events
    const handleDisputeCreated = () => {
      void fetchDisputes();
    };

    if (typeof window !== "undefined") {
      window.addEventListener("disputeCreated", handleDisputeCreated);
    }

    // Set up realtime subscription
    const channel = supabase
      .channel("disputes-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "disputes",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          void fetchDisputes();
        }
      )
      .subscribe();

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("disputeCreated", handleDisputeCreated);
      }
      void supabase.removeChannel(channel);
    };
  }, [fetchDisputes, user?.id]);

  return {
    disputes,
    loading,
    fetchDisputes,
    deleteDispute,
    updateDisputeStatus,
  };
}
