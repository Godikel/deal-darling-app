import { useQuery } from "@tanstack/react-query";
import { externalSupabase } from "@/integrations/supabase/external-client";

export interface Lead {
  id: string;
  name: string | null;
  email: string | null;
  status: string | null;
  assigned_to_email: string | null;
  created_at: string;
  last_contacted_at: string | null;
  updated_at: string;
}

export function useLeads() {
  return useQuery({
    queryKey: ["leads"],
    queryFn: async () => {
      const { data, error } = await externalSupabase
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Lead[];
    },
  });
}
