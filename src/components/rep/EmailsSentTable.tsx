import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  CheckCircle2,
  Clock,
  Forward,
  Reply,
  Loader2,
  Mail,
  Sparkles,
} from "lucide-react";
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

const STATUS_CONFIG: Record<
  LeadStatus,
  { label: string; icon: React.ElementType; badgeClass: string; dotClass: string }
> = {
  replied: {
    label: "Reply Received",
    icon: Reply,
    badgeClass: "bg-accent text-accent-foreground border-primary/20",
    dotClass: "bg-primary",
  },
  awaiting: {
    label: "Reply Awaited",
    icon: Clock,
    badgeClass: "bg-secondary text-secondary-foreground border-border",
    dotClass: "bg-muted-foreground",
  },
  followup: {
    label: "Follow-up Sent",
    icon: Forward,
    badgeClass: "bg-accent text-accent-foreground border-primary/20",
    dotClass: "bg-primary",
  },
};

function EmailRow({ lead, index }: { lead: Lead; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const [marking, setMarking] = useState(false);
  const queryClient = useQueryClient();
  const status = getLeadStatus(lead);
  const config = STATUS_CONFIG[status];

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
      <motion.tr
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.04, type: "spring", stiffness: 300, damping: 25 }}
        className="cursor-pointer hover:bg-accent/20 transition-all duration-200 group border-b border-border/30 last:border-0"
        onClick={() => setExpanded(!expanded)}
      >
        <TableCell className="py-3.5">
          <div className="flex items-center gap-2.5">
            <motion.div
              animate={{ rotate: expanded ? 0 : -90 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            </motion.div>
            <div>
              <p className="text-[13px] font-semibold tracking-tight group-hover:text-primary transition-colors">
                {lead.company_name || "—"}
              </p>
              <p className="text-[11px] text-muted-foreground">{lead.poc_name || "—"}</p>
            </div>
          </div>
        </TableCell>
        <TableCell className="py-3.5">
          <p className="text-[12px] text-muted-foreground max-w-[220px] truncate leading-relaxed">
            {lead.email_subject || "—"}
          </p>
        </TableCell>
        <TableCell className="py-3.5">
          <Badge
            variant="outline"
            className={`text-[10px] font-semibold gap-1.5 px-2.5 py-0.5 ${config.badgeClass}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${config.dotClass}`} />
            {config.label}
          </Badge>
        </TableCell>
        <TableCell className="py-3.5">
          <div className="space-y-0.5">
            <p className="text-[11px] text-muted-foreground">
              {timeInfo.label}:{" "}
              <span className="font-semibold text-foreground">{timeInfo.value}</span>
            </p>
            {timeInfo.extra && (
              <p className="text-[11px] text-muted-foreground">
                {timeInfo.extra.label}:{" "}
                <span className={`font-semibold ${
                  timeInfo.extra.value === "Overdue" ? "text-destructive" : "text-foreground"
                }`}>
                  {timeInfo.extra.value}
                </span>
              </p>
            )}
          </div>
        </TableCell>
        <TableCell className="py-3.5">
          {status === "replied" && (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-[11px] font-semibold gap-1.5 border-primary/20 text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-200"
                onClick={handleMarkComplete}
                disabled={marking}
              >
                {marking ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-3 w-3" />
                )}
                Complete
              </Button>
            </motion.div>
          )}
        </TableCell>
      </motion.tr>
      <AnimatePresence>
        {expanded && lead.email_body && (
          <tr>
            <td colSpan={5} className="p-0">
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="overflow-hidden"
              >
                <div className="mx-4 mb-3 mt-0 p-4 rounded-lg bg-muted/40 border border-border/30 space-y-2">
                  {lead.email_subject && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5 text-primary shrink-0" />
                      <p className="text-[12px] font-semibold tracking-tight">
                        {lead.email_subject}
                      </p>
                    </div>
                  )}
                  <p className="text-[12px] text-muted-foreground whitespace-pre-wrap leading-relaxed pl-5.5">
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
        (l.status === "SENT" ||
          l.status === "REPLIED" ||
          l.status === "FOLLOW UP" ||
          l.last_contacted_at ||
          l.reply_received ||
          l.follow_up_sent_at) &&
        l.status !== "COMPLETED"
    );
  }, [leads]);

  const completedLeads = useMemo(() => {
    return leads.filter((l) => l.status === "COMPLETED");
  }, [leads]);

  if (emailLeads.length === 0 && completedLeads.length === 0) {
    return (
      <Card className="glass-card metric-shadow p-10 text-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
            <Mail className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground font-medium">No emails sent yet.</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Active Emails */}
      <Card className="glass-card metric-shadow overflow-hidden">
        <div className="px-5 py-4 border-b border-border/40 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Mail className="h-4 w-4 text-primary" />
            </div>
            <h3 className="text-sm font-bold tracking-tight">Emails Sent</h3>
          </div>
          <Badge variant="secondary" className="font-mono text-xs font-bold px-2.5">
            {emailLeads.length}
          </Badge>
        </div>
        {emailLeads.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border/30 hover:bg-transparent">
                  <TableHead className="text-[11px] uppercase tracking-widest font-bold text-muted-foreground w-[200px]">
                    Company / POC
                  </TableHead>
                  <TableHead className="text-[11px] uppercase tracking-widest font-bold text-muted-foreground">
                    Subject
                  </TableHead>
                  <TableHead className="text-[11px] uppercase tracking-widest font-bold text-muted-foreground w-[140px]">
                    Status
                  </TableHead>
                  <TableHead className="text-[11px] uppercase tracking-widest font-bold text-muted-foreground w-[160px]">
                    Timeline
                  </TableHead>
                  <TableHead className="text-[11px] uppercase tracking-widest font-bold text-muted-foreground w-[100px]">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {emailLeads.map((lead, i) => (
                  <EmailRow key={lead.id} lead={lead} index={i} />
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="p-8 text-center text-sm text-muted-foreground font-medium">
            No active emails.
          </div>
        )}
      </Card>

      {/* Completed Section */}
      {completedLeads.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="glass-card overflow-hidden border-border/30">
            <div className="px-5 py-3.5 border-b border-border/30 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-7 w-7 rounded-lg bg-accent flex items-center justify-center">
                  <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                </div>
                <h3 className="text-[13px] font-bold tracking-tight text-muted-foreground">
                  Completed
                </h3>
              </div>
              <Badge variant="secondary" className="font-mono text-[10px] font-bold">
                {completedLeads.length}
              </Badge>
            </div>
            <Table>
              <TableBody>
                {completedLeads.map((lead, i) => (
                  <motion.tr
                    key={lead.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.6 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-border/20 hover:opacity-100 transition-opacity"
                  >
                    <TableCell className="text-[12px] font-medium py-2.5">
                      {lead.company_name || "—"}
                    </TableCell>
                    <TableCell className="text-[12px] text-muted-foreground py-2.5">
                      {lead.poc_name || "—"}
                    </TableCell>
                    <TableCell className="text-[12px] text-muted-foreground truncate max-w-[250px] py-2.5">
                      {lead.email_subject || "—"}
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
