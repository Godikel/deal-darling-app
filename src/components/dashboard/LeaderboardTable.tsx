import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Lead } from "@/hooks/useLeads";

interface LeaderboardTableProps {
  leads: Lead[];
}

interface LeaderboardEntry {
  email: string;
  sent: number;
  replied: number;
  total: number;
}

export function LeaderboardTable({ leads }: LeaderboardTableProps) {
  const assigned = leads.filter((l) => l.assigned_to_email);
  const map = new Map<string, { sent: number; replied: number }>();

  for (const lead of assigned) {
    const email = lead.assigned_to_email!;
    const entry = map.get(email) || { sent: 0, replied: 0 };
    if (lead.status === "SENT") entry.sent++;
    if (lead.status === "REPLIED") entry.replied++;
    map.set(email, entry);
  }

  const leaderboard: LeaderboardEntry[] = Array.from(map.entries())
    .map(([email, { sent, replied }]) => ({ email, sent, replied, total: sent + replied }))
    .sort((a, b) => b.total - a.total);

  if (leaderboard.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Rep Leaderboard</CardTitle>
        </CardHeader>
        <CardContent className="flex h-[250px] items-center justify-center">
          <p className="text-sm text-muted-foreground">No Data</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Rep Leaderboard</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Rep</TableHead>
              <TableHead className="text-right">Sent</TableHead>
              <TableHead className="text-right">Replied</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leaderboard.map((entry) => (
              <TableRow key={entry.email}>
                <TableCell className="font-medium">{entry.email}</TableCell>
                <TableCell className="text-right">{entry.sent}</TableCell>
                <TableCell className="text-right">{entry.replied}</TableCell>
                <TableCell className="text-right font-semibold">{entry.total}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
