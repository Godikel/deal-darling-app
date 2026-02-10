import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, CheckCircle2, Clock, Forward, Reply, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { externalSupabase } from "@/integrations/supabase/external-client";
import { useQueryClient } from "@tanstack/react-query";
import type { Lead } from "@/hooks/useLeads";

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return "—";
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  if (days > 0) return `${days}d ${hours}h ago`;
  if (hours > 0) return `${hours}h ago`;
  const mins = Math.floor(diff / (1000 * 60));
  return `${mins}m ago`;
}

function followUpCountdown(lastContactedAt: string | null): string {
  if (!lastContactedAt) return "—";
  const sent = new Date(lastContactedAt).getTime();
  const followUpDeadline = sent + 7 * 24 * 60 * 60 * 1000;
  const remaining = followUpDeadline - Date.now();
  if (remaining <= 0) return "Overdue";
  const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
  const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  return `${days}d ${hours}h left`;
}

type LeadStatus = "replied" | "awaiting" | "followup";

function getLeadStatus(lead: Lead): LeadStatus {
  if (lead.status === "REPLIED" || lead.reply_received) return "replied";
  if (lead.status === "FOLLOW UP" || lead.follow_up_sent_at) return "followup";
  return "awaiting";
}

const STATUS_CONFIG: Record<LeadStatus, { label: string; icon: React.ElementType; className: string }> = {
  replied: { label: "Reply Received", icon: Reply, className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
  awaiting: { label: "Reply Awaited", icon: Clock, className: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
  followup: { label: "Follow-up Sent", icon: Forward, className: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
};

function EmailRow({ lead }: { lead: Lead }) {
  const [expanded, setExpanded] = useState(false);
  const [marking, setMarking] = useState(false);
  const queryClient = useQueryClient();
  const status = getLeadStatus(lead);
  const config = STATUS_CONFIG[status];
  const StatusIcon = config.icon;

  const handleMarkComplete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setMarking(true);
    try {
      await externalSupabase
        .from("leads")
        .update({ status: "COMPLETED" })
        .eq("id", lead.id);
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    } finally {
      setMarking(false);
    }
  };

  const timeInfo = useMemo(() => {
    switch (status) {
      case "replied":
        return { label: "Since reply", value: timeAgo(lead.last_contacted_at) };
      case "awaiting":
        return {
          label: "Since sent",
          value: timeAgo(lead.last_contacted_at),
          extra: { label: "Follow-up in", value: followUpCountdown(lead.last_contacted_at) },
        };
      case "followup":
        return { label: "Since follow-up", value: timeAgo(lead.follow_up_sent_at) };
    }
  }, [status, lead.last_contacted_at, lead.follow_up_sent_at]);

  return (
    <>
      <TableRow
        className="cursor-pointer hover:bg-accent/30 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <TableCell className="font-medium text-sm">
          <div className="flex items-center gap-2">
            <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform shrink-0 ${expanded ? "rotate-0" : "-rotate-90"}`} />
            {lead.company_name || "—"}
          </div>
        </TableCell>
        <TableCell className="text-sm text-muted-foreground">
          {lead.poc_name || "—"}
        </TableCell>
        <TableCell className="text-sm max-w-[200px] truncate">
          {lead.email_subject || "—"}
        </TableCell>
        <TableCell>
          <Badge variant="outline" className={`text-[10px] font-medium gap-1 ${config.className}`}>
            <StatusIcon className="h-3 w-3" />
            {config.label}
          </Badge>
        </TableCell>
        <TableCell className="text-xs text-muted-foreground">
          <div className="space-y-0.5">
            <p>{timeInfo.label}: <span className="font-medium text-foreground">{timeInfo.value}</span></p>
            {timeInfo.extra && (
              <p>{timeInfo.extra.label}: <span className="font-medium text-foreground">{timeInfo.extra.value}</span></p>
            )}
          </div>
        </TableCell>
        <TableCell>
          {status === "replied" && (
            <Button
              size="sm"
              variant="ghost"
              className="h-7 text-xs gap-1 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-500/10"
              onClick={handleMarkComplete}
              disabled={marking}
            >
              {marking ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle2 className="h-3 w-3" />}
              Complete
            </Button>
          )}
        </TableCell>
      </TableRow>
      <AnimatePresence>
        {expanded && lead.email_body && (
          <tr>
            <td colSpan={6} className="p-0">
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="px-6 py-3 bg-muted/30 border-b border-border/30 space-y-1.5">
                  {lead.email_subject && (
                    <p className="text-xs font-medium">
                      <span className="text-muted-foreground">Subject:</span> {lead.email_subject}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed">
                    {lead.email_body}
                  </p>
                </div>
              </motion.div>
            </td>
          </tr>
        )}
      </AnimatePresence>
    </>
  );
}

export default function EmailsSentTable({ leads }: { leads: Lead[] }) {
  const emailLeads = useMemo(() => {
    return leads.filter(
      (l) =>
        (l.status === "SENT" || l.status === "REPLIED" || l.status === "FOLLOW UP" ||
          l.last_contacted_at || l.reply_received || l.follow_up_sent_at) &&
        l.status !== "COMPLETED"
    );
  }, [leads]);

  const completedLeads = useMemo(() => {
    return leads.filter((l) => l.status === "COMPLETED");
  }, [leads]);

  if (emailLeads.length === 0 && completedLeads.length === 0) {
    return (
      <Card className="glass-card metric-shadow p-8 text-center">
        <p className="text-sm text-muted-foreground">No emails sent yet.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="glass-card metric-shadow overflow-hidden">
        <div className="px-5 py-3 border-b border-border/50">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            Emails Sent
            <Badge variant="secondary" className="font-mono text-xs">{emailLeads.length}</Badge>
          </h3>
        </div>
        {emailLeads.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[160px]">Company</TableHead>
                <TableHead className="w-[120px]">POC</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead className="w-[140px]">Status</TableHead>
                <TableHead className="w-[160px]">Timeline</TableHead>
                <TableHead className="w-[90px]">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {emailLeads.map((lead) => (
                <EmailRow key={lead.id} lead={lead} />
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="p-6 text-center text-sm text-muted-foreground">No active emails.</div>
        )}
      </Card>

      {completedLeads.length > 0 && (
        <Card className="glass-card metric-shadow overflow-hidden opacity-75">
          <div className="px-5 py-3 border-b border-border/50">
            <h3 className="text-sm font-semibold flex items-center gap-2 text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              Completed
              <Badge variant="secondary" className="font-mono text-xs">{completedLeads.length}</Badge>
            </h3>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>POC</TableHead>
                <TableHead>Subject</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {completedLeads.map((lead) => (
                <TableRow key={lead.id} className="text-muted-foreground">
                  <TableCell className="text-sm">{lead.company_name || "—"}</TableCell>
                  <TableCell className="text-sm">{lead.poc_name || "—"}</TableCell>
                  <TableCell className="text-sm truncate max-w-[250px]">{lead.email_subject || "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
