import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart3, ChevronDown, ChevronRight, Mail, Reply, Clock, Forward } from "lucide-react";
import type { Lead } from "@/hooks/useLeads";

import hardikAvatar from "@/assets/avatars/hardik.png";
import namanAvatar from "@/assets/avatars/naman.png";
import vanshikaAvatar from "@/assets/avatars/vanshika.png";
import vivekAvatar from "@/assets/avatars/vivek.png";

const AVATAR_MAP: Record<string, string> = {
  "hardik.goel@betterplace.co.in": hardikAvatar,
  "naman.taneja@betterplace.co.in": namanAvatar,
  "vanshika.saxena@betterplace.co.in": vanshikaAvatar,
  "vivek.rajalingam@betterplace.co.in": vivekAvatar,
};

interface LeaderboardTableProps {
  leads: Lead[];
}

interface RepData {
  email: string;
  claimed: number;
  sent: number;
  replied: number;
  followUp: number;
  total: number;
  claimedLeads: Lead[];
  repliedLeads: Lead[];
  awaitingLeads: Lead[];
  followUpLeads: Lead[];
}

const ENSURE_REPS = ["naman.taneja@betterplace.co.in"];

function LeadItem({ lead, showEmail }: { lead: Lead; showEmail?: boolean }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-border/40 rounded-lg overflow-hidden">
      <button
        onClick={() => showEmail && lead.email_body ? setExpanded(!expanded) : null}
        className={`w-full text-left px-3 py-2 flex items-center justify-between gap-2 ${
          showEmail && lead.email_body ? "cursor-pointer hover:bg-accent/30" : "cursor-default"
        }`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm font-medium truncate">{lead.company_name || "—"}</span>
          {lead.poc_name && (
            <span className="text-xs text-muted-foreground truncate">· {lead.poc_name}</span>
          )}
        </div>
        {showEmail && lead.email_body && (
          <ChevronDown className={`h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform ${expanded ? "rotate-180" : ""}`} />
        )}
      </button>
      <AnimatePresence>
        {expanded && lead.email_body && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 pt-1 border-t border-border/30 space-y-1">
              {lead.email_subject && (
                <p className="text-xs font-medium text-foreground">Subject: {lead.email_subject}</p>
              )}
              <p className="text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed">
                {lead.email_body}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ExpandableSection({
  label,
  icon: Icon,
  count,
  leads,
  showEmail,
  variant = "default",
}: {
  label: string;
  icon: React.ElementType;
  count: number;
  leads: Lead[];
  showEmail?: boolean;
  variant?: "default" | "success" | "warning" | "info";
}) {
  const [open, setOpen] = useState(false);

  const variantStyles = {
    default: "text-muted-foreground",
    success: "text-emerald-600",
    warning: "text-amber-600",
    info: "text-blue-600",
  };

  return (
    <div>
      <button
        onClick={() => leads.length > 0 && setOpen(!open)}
        className={`flex items-center gap-2 w-full text-left py-1 ${leads.length > 0 ? "cursor-pointer hover:opacity-80" : "cursor-default"}`}
      >
        {leads.length > 0 ? (
          open ? <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
        ) : (
          <span className="w-3.5" />
        )}
        <Icon className={`h-3.5 w-3.5 ${variantStyles[variant]}`} />
        <span className="text-xs text-muted-foreground">{label}</span>
        <Badge variant="secondary" className="text-[10px] h-5 px-1.5 font-mono">
          {count}
        </Badge>
      </button>
      <AnimatePresence>
        {open && leads.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="ml-6 mt-1 mb-2 space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {leads.map((lead) => (
                <LeadItem key={lead.id} lead={lead} showEmail={showEmail} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function LeaderboardTable({ leads }: LeaderboardTableProps) {
  const [expandedRep, setExpandedRep] = useState<string | null>(null);

  const assigned = leads.filter((l) => l.assigned_to_email);
  const map = new Map<string, { claimed: Lead[]; replied: Lead[]; awaiting: Lead[]; followUp: Lead[] }>();

  for (const rep of ENSURE_REPS) {
    map.set(rep, { claimed: [], replied: [], awaiting: [], followUp: [] });
  }

  for (const lead of assigned) {
    const email = lead.assigned_to_email!;
    const entry = map.get(email) || { claimed: [], replied: [], awaiting: [], followUp: [] };
    entry.claimed.push(lead);
    if (lead.status === "REPLIED" || lead.reply_received) {
      entry.replied.push(lead);
    } else if (lead.status === "FOLLOW UP" || lead.follow_up_sent_at) {
      entry.followUp.push(lead);
    } else if (lead.status === "SENT" || lead.last_contacted_at) {
      entry.awaiting.push(lead);
    }
    map.set(email, entry);
  }

  const repData: RepData[] = Array.from(map.entries())
    .map(([email, { claimed, replied, awaiting, followUp }]) => ({
      email,
      claimed: claimed.length,
      sent: replied.length + awaiting.length + followUp.length,
      replied: replied.length,
      followUp: followUp.length,
      total: replied.length + awaiting.length + followUp.length,
      claimedLeads: claimed,
      repliedLeads: replied,
      awaitingLeads: awaiting,
      followUpLeads: followUp,
    }))
    .sort((a, b) => b.total - a.total);

  const getInitials = (email: string) => {
    const name = email.split("@")[0].split(".");
    return name.map((n) => n[0]?.toUpperCase()).join("").slice(0, 2);
  };

  if (repData.length === 0) {
    return (
      <Card className="glass-card metric-shadow">
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Rep Stats
          </CardTitle>
        </CardHeader>
        <CardContent className="flex h-[250px] items-center justify-center">
          <p className="text-sm text-muted-foreground">No Data</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }}>
      <Card className="glass-card metric-shadow">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Rep Stats
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-border/50 hover:bg-transparent">
                <TableHead>Rep</TableHead>
                <TableHead className="text-right">Claimed</TableHead>
                <TableHead className="text-right">Sent</TableHead>
                <TableHead className="text-right">Replied</TableHead>
                <TableHead className="text-right">Follow-ups</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {repData.map((entry, index) => {
                const isExpanded = expandedRep === entry.email;
                return (
                  <>
                    <motion.tr
                      key={entry.email}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.5 + index * 0.05 }}
                      className="border-border/30 hover:bg-accent/50 transition-colors cursor-pointer"
                      onClick={() => setExpandedRep(isExpanded ? null : entry.email)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4 text-muted-foreground absolute -left-5 top-2" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-muted-foreground absolute -left-5 top-2" />
                            )}
                            <Avatar className="h-8 w-8 border-2 border-border">
                              {AVATAR_MAP[entry.email] && (
                                <AvatarImage src={AVATAR_MAP[entry.email]} alt={entry.email} />
                              )}
                              <AvatarFallback className="text-xs font-semibold gradient-bg text-primary-foreground">
                                {getInitials(entry.email)}
                              </AvatarFallback>
                            </Avatar>
                          </div>
                          <div>
                            <p className="font-medium text-sm">
                              {entry.email.split("@")[0].replace(".", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                            </p>
                            <p className="text-xs text-muted-foreground">{entry.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm">{entry.claimed}</TableCell>
                      <TableCell className="text-right font-mono text-sm">{entry.sent}</TableCell>
                      <TableCell className="text-right font-mono text-sm">{entry.replied}</TableCell>
                      <TableCell className="text-right font-mono text-sm">{entry.followUp}</TableCell>
                      <TableCell className="text-right">
                        <span className="font-mono font-bold text-sm">{entry.total}</span>
                      </TableCell>
                    </motion.tr>
                    <AnimatePresence>
                      {isExpanded && (
                        <tr key={`${entry.email}-details`}>
                          <td colSpan={6} className="p-0">
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.25 }}
                              className="overflow-hidden"
                            >
                              <div className="px-6 py-4 bg-accent/20 border-b border-border/30 space-y-1">
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                                  My Leads
                                </p>
                                <ExpandableSection
                                  label="Claimed Leads"
                                  icon={BarChart3}
                                  count={entry.claimed}
                                  leads={entry.claimedLeads}
                                />
                                <ExpandableSection
                                  label="Reply Received"
                                  icon={Reply}
                                  count={entry.replied}
                                  leads={entry.repliedLeads}
                                  showEmail
                                  variant="success"
                                />
                                <ExpandableSection
                                  label="Reply Awaited"
                                  icon={Clock}
                                  count={entry.awaitingLeads.length}
                                  leads={entry.awaitingLeads}
                                  showEmail
                                  variant="warning"
                                />
                                <ExpandableSection
                                  label="Follow-up Sent"
                                  icon={Forward}
                                  count={entry.followUp}
                                  leads={entry.followUpLeads}
                                  showEmail
                                  variant="info"
                                />
                              </div>
                            </motion.div>
                          </td>
                        </tr>
                      )}
                    </AnimatePresence>
                  </>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </motion.div>
  );
}
