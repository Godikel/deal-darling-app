import { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Mail, Reply, Forward, Users, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useLeads } from "@/hooks/useLeads";
import type { Lead } from "@/hooks/useLeads";
import EmailsSentTable from "@/components/rep/EmailsSentTable";
import ClaimedLeadsSection from "@/components/rep/ClaimedLeadsSection";

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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring" as const, stiffness: 300, damping: 24 },
  },
} as const;

const cardHover = {
  rest: { scale: 1, boxShadow: "0 4px 24px -4px hsl(243 75% 59% / 0.08)" },
  hover: {
    scale: 1.03,
    boxShadow: "0 8px 32px -4px hsl(243 75% 59% / 0.18)",
    transition: { type: "spring" as const, stiffness: 400, damping: 20 },
  },
} as const;

interface MetricCardProps {
  icon: React.ElementType;
  value: number;
  label: string;
  accentClass: string;
}

function MetricCard({ icon: Icon, value, label, accentClass }: MetricCardProps) {
  return (
    <motion.div variants={itemVariants} initial="rest" whileHover="hover" animate="rest">
      <motion.div variants={cardHover}>
        <Card className="glass-card metric-shadow p-5 flex items-center gap-4 overflow-hidden relative group">
          <div className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 ${accentClass} transition-transform duration-300 group-hover:scale-110`}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <motion.p
              className="text-3xl font-extrabold font-mono tracking-tight"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
            >
              {value}
            </motion.p>
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-semibold mt-0.5">
              {label}
            </p>
          </div>
          <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-primary/5 blur-2xl group-hover:bg-primary/10 transition-colors duration-500" />
        </Card>
      </motion.div>
    </motion.div>
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
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="border-b border-border/50 bg-card/60 backdrop-blur-xl sticky top-0 z-10"
      >
        <div className="mx-auto max-w-5xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="icon" className="shrink-0 hover:bg-accent/60 transition-colors">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-3.5">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.15 }}
              >
                <Avatar className="h-12 w-12 border-2 border-primary/20 ring-2 ring-primary/10 ring-offset-2 ring-offset-background">
                  {AVATAR_MAP[decodedEmail] && (
                    <AvatarImage src={AVATAR_MAP[decodedEmail]} alt={decodedEmail} />
                  )}
                  <AvatarFallback className="text-sm font-bold gradient-bg text-primary-foreground">
                    {getInitials(decodedEmail)}
                  </AvatarFallback>
                </Avatar>
              </motion.div>
              <div>
                <motion.h1
                  className="text-xl font-extrabold tracking-tight"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  {displayName}
                </motion.h1>
                <motion.p
                  className="text-xs text-muted-foreground font-medium"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  {decodedEmail}
                </motion.p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Content */}
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {isLoading ? (
          <motion.div
            className="flex items-center justify-center h-64"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="flex flex-col items-center gap-4">
              <motion.div
                className="h-10 w-10 rounded-full border-2 border-primary border-t-transparent"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              <p className="text-sm text-muted-foreground font-medium">Loading leads…</p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            {/* Metric cards */}
            <motion.div variants={itemVariants} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <MetricCard
                icon={Users}
                value={claimedLeads.length}
                label="Claimed"
                accentClass="bg-primary/10 text-primary"
              />
              <MetricCard
                icon={Mail}
                value={emailsSent}
                label="Emails Sent"
                accentClass="bg-primary/10 text-primary"
              />
              <MetricCard
                icon={Reply}
                value={repliedLeads.length}
                label="Replied"
                accentClass="bg-accent text-accent-foreground"
              />
              <MetricCard
                icon={Forward}
                value={followUpLeads.length}
                label="Follow-ups"
                accentClass="bg-accent text-accent-foreground"
              />
            </motion.div>

            {/* Claimed Leads */}
            <motion.div variants={itemVariants}>
              <ClaimedLeadsSection leads={claimedLeads} />
            </motion.div>

            {/* Emails Sent Table */}
            <motion.div variants={itemVariants}>
              <EmailsSentTable leads={repLeads} />
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default RepLeads;
