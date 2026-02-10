import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Lead } from "@/hooks/useLeads";

interface RepBarChartProps {
  leads: Lead[];
}

export function RepBarChart({ leads }: RepBarChartProps) {
  const assigned = leads.filter((l) => l.assigned_to_email);
  const map = new Map<string, { claimed: number; sent: number; replied: number; followUp: number }>();

  for (const lead of assigned) {
    const email = lead.assigned_to_email!;
    const entry = map.get(email) || { claimed: 0, sent: 0, replied: 0, followUp: 0 };
    entry.claimed++;
    if (lead.status === "SENT") entry.sent++;
    if (lead.status === "REPLIED") entry.replied++;
    if (lead.status === "FOLLOW UP") entry.followUp++;
    map.set(email, entry);
  }

  const data = Array.from(map.entries())
    .map(([email, stats]) => ({
      name: email.split("@")[0],
      Claimed: stats.claimed,
      Sent: stats.sent,
      Replied: stats.replied,
      "Follow-ups": stats.followUp,
    }))
    .sort((a, b) => b.Claimed - a.Claimed);

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Rep Performance</CardTitle>
        </CardHeader>
        <CardContent className="flex h-[300px] items-center justify-center">
          <p className="text-sm text-muted-foreground">No Data</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Rep Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="name" className="text-xs" />
            <YAxis allowDecimals={false} className="text-xs" />
            <Tooltip />
            <Legend />
            <Bar dataKey="Claimed" fill="hsl(222.2, 47.4%, 11.2%)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Sent" fill="hsl(215.4, 16.3%, 46.9%)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Replied" fill="hsl(210, 40%, 60%)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Follow-ups" fill="hsl(215.4, 16.3%, 76.9%)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
