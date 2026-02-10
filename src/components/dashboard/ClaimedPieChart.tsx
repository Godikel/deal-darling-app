import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import type { Lead } from "@/hooks/useLeads";

interface ClaimedPieChartProps {
  leads: Lead[];
}

const COLORS = [
  "hsl(243, 75%, 59%)",
  "hsl(220, 15%, 82%)",
];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload?.length) {
    return (
      <div className="glass-card rounded-lg px-3 py-2 text-sm shadow-xl">
        <p className="font-semibold">{payload[0].name}</p>
        <p className="text-muted-foreground">{payload[0].value} leads ({((payload[0].value / (payload[0].payload.total)) * 100).toFixed(1)}%)</p>
      </div>
    );
  }
  return null;
};

export function ClaimedPieChart({ leads }: ClaimedPieChartProps) {
  const claimed = leads.filter((l) => l.status === "CLAIMED" || l.assigned_to_email !== null).length;
  const unclaimed = leads.length - claimed;

  const data = [
    { name: "Claimed", value: claimed, total: leads.length },
    { name: "Unclaimed", value: unclaimed, total: leads.length },
  ];

  if (leads.length === 0) {
    return (
      <Card className="glass-card metric-shadow">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Leads Claimed vs Unclaimed</CardTitle>
        </CardHeader>
        <CardContent className="flex h-[280px] items-center justify-center">
          <p className="text-sm text-muted-foreground">No Data</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
      <Card className="glass-card metric-shadow">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Leads Claimed vs Unclaimed</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <ResponsiveContainer width="60%" height={260}>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={100}
                  paddingAngle={4}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {data.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-4">
              {data.map((entry, i) => (
                <div key={entry.name} className="flex items-center gap-3">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                  <div>
                    <p className="text-sm font-medium">{entry.name}</p>
                    <p className="text-2xl font-bold">{entry.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
