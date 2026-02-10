import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Lead } from "@/hooks/useLeads";

interface ClaimedPieChartProps {
  leads: Lead[];
}

const COLORS = ["hsl(222.2, 47.4%, 11.2%)", "hsl(215.4, 16.3%, 76.9%)"];

export function ClaimedPieChart({ leads }: ClaimedPieChartProps) {
  const claimed = leads.filter((l) => l.assigned_to_email !== null).length;
  const unclaimed = leads.length - claimed;

  const data = [
    { name: "Claimed", value: claimed },
    { name: "Unclaimed", value: unclaimed },
  ];

  if (leads.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Leads Claimed vs Unclaimed</CardTitle>
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
        <CardTitle className="text-base">Leads Claimed vs Unclaimed</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              dataKey="value"
              label={({ name, value }) => `${name}: ${value}`}
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
