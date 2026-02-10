import { useState, useMemo } from "react";
import { DateRange } from "react-day-picker";
import { subDays } from "date-fns";
import { Users, Mail, MessageSquare, MailCheck } from "lucide-react";
import { useLeads } from "@/hooks/useLeads";
import { DateRangePicker } from "@/components/dashboard/DateRangePicker";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { ClaimedPieChart } from "@/components/dashboard/ClaimedPieChart";
import { LeaderboardTable } from "@/components/dashboard/LeaderboardTable";
import { RepBarChart } from "@/components/dashboard/RepBarChart";

const Index = () => {
  const { data: leads = [], isLoading } = useLeads();
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });

  const filtered = useMemo(() => {
    if (!dateRange?.from) return leads;
    const from = dateRange.from;
    const to = dateRange.to ?? dateRange.from;
    return leads.filter((lead) => {
      const created = new Date(lead.created_at);
      const contacted = lead.last_contacted_at ? new Date(lead.last_contacted_at) : null;
      const inRange = (d: Date) => d >= from && d <= new Date(to.getTime() + 86400000 - 1);
      return inRange(created) || (contacted && inRange(contacted));
    });
  }, [leads, dateRange]);

  const totalLeads = filtered.length;
  const emailsSent = filtered.filter(
    (l) => l.status === "SENT" || l.last_contacted_at !== null
  ).length;
  const replies = filtered.filter((l) => l.status === "REPLIED").length;
  const followUps = filtered.filter((l) => l.status === "FOLLOW UP").length;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Sales CRM</h1>
            <p className="text-muted-foreground">Track your leads and outreach performance.</p>
          </div>
          <DateRangePicker dateRange={dateRange} onDateRangeChange={setDateRange} />
        </div>

        {isLoading ? (
          <p className="text-muted-foreground">Loading…</p>
        ) : (
          <>
            <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <MetricCard title="Total Leads" value={totalLeads} icon={Users} />
              <MetricCard title="Emails Sent" value={emailsSent} icon={Mail} />
              <MetricCard title="Replies Received" value={replies} icon={MessageSquare} />
              <MetricCard title="Follow-ups Sent" value={followUps} icon={MailCheck} />
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <ClaimedPieChart leads={filtered} />
              <RepBarChart leads={filtered} />
            </div>

            <div className="mt-6">
              <LeaderboardTable leads={filtered} />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Index;
