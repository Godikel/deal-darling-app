import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import { BarChart3, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
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

interface RepEntry {
  email: string;
  claimed: number;
  sent: number;
  replied: number;
  followUp: number;
  total: number;
}

const ENSURE_REPS = ["naman.taneja@betterplace.co.in"];

export function LeaderboardTable({ leads }: LeaderboardTableProps) {
  const assigned = leads.filter((l) => l.assigned_to_email);
  const map = new Map<string, { claimed: number; sent: number; replied: number; followUp: number }>();

  for (const rep of ENSURE_REPS) {
    map.set(rep, { claimed: 0, sent: 0, replied: 0, followUp: 0 });
  }

  for (const lead of assigned) {
    const email = lead.assigned_to_email!;
    const entry = map.get(email) || { claimed: 0, sent: 0, replied: 0, followUp: 0 };
    entry.claimed++;
    if (lead.status === "SENT" || lead.status === "REPLIED" || lead.status === "FOLLOW UP" || lead.last_contacted_at) {
      entry.sent++;
    }
    if (lead.status === "REPLIED" || lead.reply_received) entry.replied++;
    if (lead.status === "FOLLOW UP" || lead.follow_up_sent_at) entry.followUp++;
    map.set(email, entry);
  }

  const repData: RepEntry[] = Array.from(map.entries())
    .map(([email, { claimed, sent, replied, followUp }]) => ({
      email, claimed, sent, replied, followUp, total: sent,
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
                <TableHead className="text-right">Emails Sent</TableHead>
                <TableHead className="text-right">Replied</TableHead>
                <TableHead className="text-right">Follow-ups</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {repData.map((entry, index) => (
                <motion.tr
                  key={entry.email}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.5 + index * 0.05 }}
                  className="border-border/30 hover:bg-accent/50 transition-colors"
                >
                  <TableCell>
                    <Link
                      to={`/rep/${encodeURIComponent(entry.email)}`}
                      className="flex items-center gap-3 group"
                    >
                      <Avatar className="h-8 w-8 border-2 border-border">
                        {AVATAR_MAP[entry.email] && (
                          <AvatarImage src={AVATAR_MAP[entry.email]} alt={entry.email} />
                        )}
                        <AvatarFallback className="text-xs font-semibold gradient-bg text-primary-foreground">
                          {getInitials(entry.email)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm group-hover:text-primary transition-colors flex items-center gap-1.5">
                          {entry.email.split("@")[0].replace(".", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                          <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </p>
                        <p className="text-xs text-muted-foreground">{entry.email}</p>
                      </div>
                    </Link>
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">{entry.claimed}</TableCell>
                  <TableCell className="text-right font-mono text-sm">{entry.sent}</TableCell>
                  <TableCell className="text-right font-mono text-sm">{entry.replied}</TableCell>
                  <TableCell className="text-right font-mono text-sm">{entry.followUp}</TableCell>
                </motion.tr>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </motion.div>
  );
}
