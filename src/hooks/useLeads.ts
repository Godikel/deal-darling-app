import { useQuery } from "@tanstack/react-query";
import { externalSupabase } from "@/integrations/supabase/external-client";

export interface Lead {
  id: number;
  company_name: string | null;
  industry: string | null;
  fit_reasoning: string | null;
  workforce_size: string | null;
  poc_name: string | null;
  poc_title: string | null;
  poc_linkedin: string | null;
  status: string | null;
  assigned_to_email: string | null;
  created_at: string;
  last_contacted_at: string | null;
  email: string | null;
  phone: string | null;
  email_subject: string | null;
  email_body: string | null;
  gmail_thread_id: string | null;
  reply_received: boolean | null;
  follow_up_needed: boolean | null;
  follow_up_sent_at: string | null;
  lead_quality: string | null;
  verified_poc: string | null;
  verified_name: string | null;
  verified_title: string | null;
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
