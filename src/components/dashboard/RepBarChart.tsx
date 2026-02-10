import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import type { Lead } from "@/hooks/useLeads";

interface RepBarChartProps {
  leads: Lead[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="glass-card rounded-lg px-4 py-3 text-sm shadow-xl">
        <p className="font-semibold mb-2">{label}</p>
        {payload.map((entry: any) => (
          <div key={entry.name} className="flex items-center gap-2 py-0.5">
            <div className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: entry.color }} />
            <span className="text-muted-foreground">{entry.name}:</span>
            <span className="font-medium">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

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
      <Card className="glass-card metric-shadow">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Rep Performance</CardTitle>
        </CardHeader>
        <CardContent className="flex h-[300px] items-center justify-center">
          <p className="text-sm text-muted-foreground">No Data</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}>
      <Card className="glass-card metric-shadow">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Rep Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="Claimed" fill="hsl(243, 75%, 59%)" radius={[6, 6, 0, 0]} />
              <Bar dataKey="Sent" fill="hsl(217, 91%, 60%)" radius={[6, 6, 0, 0]} />
              <Bar dataKey="Replied" fill="hsl(142, 71%, 45%)" radius={[6, 6, 0, 0]} />
              <Bar dataKey="Follow-ups" fill="hsl(38, 92%, 50%)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </motion.div>
  );
}
