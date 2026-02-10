import { useQuery } from "@tanstack/react-query";
import { externalSupabase } from "@/integrations/supabase/external-client";

export interface Lead {
  id: number;
  company_name: string | null;
  industry: string | null;
  status: string | null;
  assigned_to_email: string | null;
  created_at: string;
  last_contacted_at: string | null;
  email: string | null;
  poc_name: string | null;
  reply_received: boolean | null;
  follow_up_needed: boolean | null;
  follow_up_sent_at: string | null;
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
