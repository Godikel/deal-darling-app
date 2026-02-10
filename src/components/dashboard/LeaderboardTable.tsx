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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import { Trophy } from "lucide-react";
import type { Lead } from "@/hooks/useLeads";

interface LeaderboardTableProps {
  leads: Lead[];
}

interface LeaderboardEntry {
  email: string;
  claimed: number;
  sent: number;
  replied: number;
  followUp: number;
  total: number;
}

const ENSURE_REPS = ["naman.taneja@betterplace.co.in"];

const RANK_COLORS = [
  "bg-amber-500/10 text-amber-600 border-amber-200",
  "bg-slate-400/10 text-slate-500 border-slate-200",
  "bg-orange-500/10 text-orange-600 border-orange-200",
];

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
    if (lead.status === "SENT") entry.sent++;
    if (lead.status === "REPLIED") entry.replied++;
    if (lead.status === "FOLLOW UP") entry.followUp++;
    map.set(email, entry);
  }

  const leaderboard: LeaderboardEntry[] = Array.from(map.entries())
    .map(([email, { claimed, sent, replied, followUp }]) => ({
      email, claimed, sent, replied, followUp, total: sent + replied + followUp,
    }))
    .sort((a, b) => b.total - a.total);

  const getInitials = (email: string) => {
    const name = email.split("@")[0].split(".");
    return name.map((n) => n[0]?.toUpperCase()).join("").slice(0, 2);
  };

  if (leaderboard.length === 0) {
    return (
      <Card className="glass-card metric-shadow">
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" />
            Rep Leaderboard
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
            <Trophy className="h-5 w-5 text-amber-500" />
            Rep Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-border/50 hover:bg-transparent">
                <TableHead className="w-12 text-center">#</TableHead>
                <TableHead>Rep</TableHead>
                <TableHead className="text-right">Claimed</TableHead>
                <TableHead className="text-right">Sent</TableHead>
                <TableHead className="text-right">Replied</TableHead>
                <TableHead className="text-right">Follow-ups</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leaderboard.map((entry, index) => (
                <motion.tr
                  key={entry.email}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.5 + index * 0.05 }}
                  className="border-border/30 hover:bg-accent/50 transition-colors"
                >
                  <TableCell className="text-center">
                    {index < 3 ? (
                      <Badge variant="outline" className={`text-xs font-bold ${RANK_COLORS[index]}`}>
                        {index + 1}
                      </Badge>
                    ) : (
                      <span className="text-sm text-muted-foreground">{index + 1}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8 border-2 border-border">
                        <AvatarFallback className="text-xs font-semibold gradient-bg text-primary-foreground">
                          {getInitials(entry.email)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{entry.email.split("@")[0].replace(".", " ").replace(/\b\w/g, c => c.toUpperCase())}</p>
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
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </motion.div>
  );
}
