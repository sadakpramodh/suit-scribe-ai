import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface LitigationCase {
  id: string;
  user_id: string;
  sr_no: number | null;
  parties: string;
  forum: string;
  particular: string | null;
  start_date: string | null;
  last_hearing_date: string | null;
  next_hearing_date: string | null;
  amount_involved: number | null;
  treatment_resolution: string | null;
  remarks: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export const useLitigationCases = () => {
  const [cases, setCases] = useState<LitigationCase[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCases = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("litigation_cases")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setCases(data || []);
    } catch (error) {
      console.error("Error fetching litigation cases:", error);
      toast.error("Failed to load litigation cases");
    } finally {
      setLoading(false);
    }
  };

  const deleteCase = async (id: string) => {
    try {
      const { error } = await supabase
        .from("litigation_cases")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast.success("Case deleted successfully");
      fetchCases();
    } catch (error) {
      console.error("Error deleting case:", error);
      toast.error("Failed to delete case");
    }
  };

  const bulkInsertCases = async (casesData: Array<Omit<Partial<LitigationCase>, 'id' | 'user_id' | 'created_at' | 'updated_at'> & { parties: string; forum: string }>) => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        console.error("Auth error:", authError);
        toast.error("Authentication error. Please log in again.");
        return;
      }

      if (!user) {
        toast.error("You must be logged in to upload cases");
        return;
      }

      console.log("User authenticated:", user.id);
      console.log("Cases to insert:", casesData);

      const casesWithUserId = casesData.map(caseData => ({
        ...caseData,
        user_id: user.id
      }));

      console.log("Cases with user_id:", casesWithUserId);

      const { data, error } = await supabase
        .from("litigation_cases")
        .insert(casesWithUserId)
        .select();

      if (error) {
        console.error("Insert error:", error);
        throw error;
      }

      console.log("Insert successful:", data);
      toast.success(`Successfully imported ${casesData.length} cases`);
      fetchCases();
    } catch (error: any) {
      console.error("Error bulk inserting cases:", error);
      toast.error(error?.message || "Failed to import cases");
    }
  };

  useEffect(() => {
    fetchCases();

    const channel = supabase
      .channel("litigation_cases_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "litigation_cases",
        },
        () => {
          fetchCases();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    cases,
    loading,
    fetchCases,
    deleteCase,
    bulkInsertCases,
  };
};
