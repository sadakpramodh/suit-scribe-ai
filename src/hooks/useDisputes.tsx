import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";

export type Dispute = {
  id: string;
  user_id: string;
  company: string;
  dispute_type: string;
  value: number;
  notice_from: string;
  notice_date: string;
  reply_due_date: string;
  responsible_user: string;
  description: string | null;
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

  const fetchDisputes = async () => {
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
        .order("created_at", { ascending: false });

      if (error) throw error;
      setDisputes(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch disputes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteDispute = async (id: string) => {
    try {
      const { error } = await supabase.from("disputes").delete().eq("id", id);

      if (error) throw error;

      setDisputes(disputes.filter((d) => d.id !== id));
      toast({
        title: "Dispute Deleted",
        description: "The dispute has been deleted successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete dispute",
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

      setDisputes(
        disputes.map((d) => (d.id === id ? { ...d, status } : d))
      );
      toast({
        title: "Status Updated",
        description: "The dispute status has been updated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update status",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchDisputes();

    // Listen for dispute creation events
    const handleDisputeCreated = () => {
      fetchDisputes();
    };
    window.addEventListener("disputeCreated", handleDisputeCreated);

    // Set up realtime subscription
    const channel = supabase
      .channel("disputes-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "disputes",
          filter: `user_id=eq.${user?.id}`,
        },
        () => {
          fetchDisputes();
        }
      )
      .subscribe();

    return () => {
      window.removeEventListener("disputeCreated", handleDisputeCreated);
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    disputes,
    loading,
    fetchDisputes,
    deleteDispute,
    updateDisputeStatus,
  };
}
