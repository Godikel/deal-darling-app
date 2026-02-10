import { useState, useMemo } from "react";
import { DateRange } from "react-day-picker";
import { subDays } from "date-fns";
import { Users, Mail, MessageSquare, MailCheck, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";
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
  const replies = filtered.filter((l) => l.status === "REPLIED" || l.reply_received === true).length;
  const followUps = filtered.filter((l) => l.status === "FOLLOW UP" || l.follow_up_sent_at !== null).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-3"
            >
              <div className="p-2 rounded-xl gradient-bg shadow-lg">
                <BarChart3 className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Sales CRM</h1>
                <p className="text-sm text-muted-foreground">Track your leads and outreach performance</p>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <DateRangePicker dateRange={dateRange} onDateRangeChange={setDateRange} />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              <p className="text-sm text-muted-foreground">Loading your data…</p>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <MetricCard title="Total Leads" value={totalLeads} icon={Users} index={0} />
              <MetricCard title="Emails Sent" value={emailsSent} icon={Mail} index={1} />
              <MetricCard title="Replies" value={replies} icon={MessageSquare} index={2} />
              <MetricCard title="Follow-ups" value={followUps} icon={MailCheck} index={3} />
            </div>

            <div className="mb-8 grid gap-6 lg:grid-cols-2">
              <ClaimedPieChart leads={filtered} />
              <RepBarChart leads={filtered} />
            </div>

            <LeaderboardTable leads={filtered} />
          </>
        )}
      </div>
    </div>
  );
};

export default Index;
