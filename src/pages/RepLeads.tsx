import { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, BarChart3, ChevronDown, ChevronRight, Mail, Reply, Clock, Forward, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useLeads } from "@/hooks/useLeads";
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

function LeadCard({ lead, showEmail }: { lead: Lead; showEmail?: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const hasEmail = showEmail && lead.email_body;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="border border-border/40 rounded-lg overflow-hidden bg-card/50"
    >
      <button
        onClick={() => hasEmail && setExpanded(!expanded)}
        className={`w-full text-left px-4 py-3 flex items-center justify-between gap-3 ${
          hasEmail ? "cursor-pointer hover:bg-accent/30" : "cursor-default"
        }`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{lead.company_name || "—"}</p>
            <p className="text-xs text-muted-foreground truncate">
              {lead.poc_name || "No POC"}{lead.poc_title ? ` · ${lead.poc_title}` : ""}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {lead.status && (
            <Badge variant="outline" className="text-[10px]">
              {lead.status}
            </Badge>
          )}
          {hasEmail && (
            <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${expanded ? "rotate-180" : ""}`} />
          )}
        </div>
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
            <div className="px-4 pb-3 pt-1 border-t border-border/30 space-y-1.5">
              {lead.email_subject && (
                <p className="text-xs font-medium text-foreground">
                  <span className="text-muted-foreground">Subject:</span> {lead.email_subject}
                </p>
              )}
              <p className="text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed">
                {lead.email_body}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function Section({
  label,
  icon: Icon,
  count,
  leads,
  showEmail,
  variant = "default",
  defaultOpen = false,
}: {
  label: string;
  icon: React.ElementType;
  count: number;
  leads: Lead[];
  showEmail?: boolean;
  variant?: "default" | "success" | "warning" | "info";
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  const variantColors = {
    default: "text-muted-foreground",
    success: "text-emerald-600",
    warning: "text-amber-600",
    info: "text-blue-600",
  };

  return (
    <Card className="glass-card metric-shadow">
      <button
        onClick={() => leads.length > 0 && setOpen(!open)}
        className={`w-full text-left px-5 py-4 flex items-center justify-between ${
          leads.length > 0 ? "cursor-pointer" : "cursor-default"
        }`}
      >
        <div className="flex items-center gap-3">
          {leads.length > 0 ? (
            open ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />
          ) : (
            <span className="w-4" />
          )}
          <Icon className={`h-5 w-5 ${variantColors[variant]}`} />
          <span className="text-sm font-semibold">{label}</span>
        </div>
        <Badge variant="secondary" className="font-mono text-xs px-2.5">
          {count}
        </Badge>
      </button>
      <AnimatePresence>
        {open && leads.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-4 space-y-2 max-h-[400px] overflow-y-auto">
              {leads.map((lead) => (
                <LeadCard key={lead.id} lead={lead} showEmail={showEmail} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

const RepLeads = () => {
  const { email } = useParams<{ email: string }>();
  const decodedEmail = decodeURIComponent(email || "");
  const { data: allLeads = [], isLoading } = useLeads();

  const repLeads = useMemo(
    () => allLeads.filter((l) => l.assigned_to_email === decodedEmail),
    [allLeads, decodedEmail]
  );

  const claimedLeads = repLeads;
  const repliedLeads = repLeads.filter((l) => l.status === "REPLIED" || l.reply_received);
  const awaitingLeads = repLeads.filter(
    (l) => (l.status === "SENT" || l.last_contacted_at) && !l.reply_received && l.status !== "REPLIED" && l.status !== "FOLLOW UP" && !l.follow_up_sent_at
  );
  const followUpLeads = repLeads.filter((l) => l.status === "FOLLOW UP" || l.follow_up_sent_at);
  const emailsSent = repliedLeads.length + awaitingLeads.length + followUpLeads.length;

  const displayName = decodedEmail
    .split("@")[0]
    .replace(".", " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  const getInitials = (e: string) => {
    const parts = e.split("@")[0].split(".");
    return parts.map((n) => n[0]?.toUpperCase()).join("").slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="icon" className="shrink-0">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 border-2 border-border">
                {AVATAR_MAP[decodedEmail] && (
                  <AvatarImage src={AVATAR_MAP[decodedEmail]} alt={decodedEmail} />
                )}
                <AvatarFallback className="text-sm font-semibold gradient-bg text-primary-foreground">
                  {getInitials(decodedEmail)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-xl font-bold tracking-tight">{displayName}</h1>
                <p className="text-xs text-muted-foreground">{decodedEmail}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              <p className="text-sm text-muted-foreground">Loading leads…</p>
            </div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-4"
          >
            {/* Summary cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
              <Card className="glass-card metric-shadow p-4 flex items-center gap-3">
                <Users className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-2xl font-bold font-mono">{claimedLeads.length}</p>
                  <p className="text-xs text-muted-foreground">Claimed</p>
                </div>
              </Card>
              <Card className="glass-card metric-shadow p-4 flex items-center gap-3">
                <Mail className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-2xl font-bold font-mono">{emailsSent}</p>
                  <p className="text-xs text-muted-foreground">Emails Sent</p>
                </div>
              </Card>
              <Card className="glass-card metric-shadow p-4 flex items-center gap-3">
                <Reply className="h-5 w-5 text-emerald-600" />
                <div>
                  <p className="text-2xl font-bold font-mono">{repliedLeads.length}</p>
                  <p className="text-xs text-muted-foreground">Replied</p>
                </div>
              </Card>
              <Card className="glass-card metric-shadow p-4 flex items-center gap-3">
                <Forward className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold font-mono">{followUpLeads.length}</p>
                  <p className="text-xs text-muted-foreground">Follow-ups</p>
                </div>
              </Card>
            </div>

            {/* Expandable sections */}
            <Section label="Claimed Leads" icon={Users} count={claimedLeads.length} leads={claimedLeads} defaultOpen />
            <Section label="Emails Sent — Reply Received" icon={Reply} count={repliedLeads.length} leads={repliedLeads} showEmail variant="success" />
            <Section label="Emails Sent — Reply Awaited" icon={Clock} count={awaitingLeads.length} leads={awaitingLeads} showEmail variant="warning" />
            <Section label="Emails Sent — Follow-up Sent" icon={Forward} count={followUpLeads.length} leads={followUpLeads} showEmail variant="info" />
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default RepLeads;
