import { Link } from "react-router-dom";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { RevenueGoalCard } from "@/components/dashboard/RevenueGoalCard";
import { TechnicianCard } from "@/components/dashboard/TechnicianCard";
import { JobMetricsChart } from "@/components/dashboard/JobMetricsChart";
import { BonusTracker } from "@/components/dashboard/BonusTracker";
import { PerformanceTable } from "@/components/dashboard/PerformanceTable";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { Users, Wrench, DollarSign, Clock } from "lucide-react";

// Mock data - will be replaced with real data later
const technicians = [
  {
    name: "Marcus Rodriguez",
    role: "Senior Technician",
    jobsCompleted: 12,
    hoursWorked: 42,
    efficiency: 94,
    revenue: 8750,
    status: "active" as const,
  },
  {
    name: "Jake Thompson",
    role: "Paint Specialist",
    jobsCompleted: 8,
    hoursWorked: 38,
    efficiency: 87,
    revenue: 6200,
    status: "active" as const,
  },
  {
    name: "Derek Kim",
    role: "Body Tech",
    jobsCompleted: 10,
    hoursWorked: 40,
    efficiency: 91,
    revenue: 7100,
    status: "break" as const,
  },
  {
    name: "Carlos Mendez",
    role: "Frame Tech",
    jobsCompleted: 6,
    hoursWorked: 36,
    efficiency: 78,
    revenue: 4800,
    status: "active" as const,
  },
];

const jobMetricsData = [
  { name: "Mon", completed: 8, pending: 3 },
  { name: "Tue", completed: 12, pending: 5 },
  { name: "Wed", completed: 10, pending: 4 },
  { name: "Thu", completed: 15, pending: 2 },
  { name: "Fri", completed: 11, pending: 6 },
  { name: "Sat", completed: 6, pending: 1 },
];

const bonusTiers = [
  { name: "Bronze", threshold: 20000, bonus: 250, achieved: true },
  { name: "Silver", threshold: 35000, bonus: 500, achieved: true },
  { name: "Gold", threshold: 50000, bonus: 1000, achieved: false },
  { name: "Platinum", threshold: 75000, bonus: 2000, achieved: false },
];

const performanceRecords = [
  {
    id: "1",
    date: "Feb 5, 2026",
    employee: "Marcus Rodriguez",
    type: "commendation" as const,
    summary: "Exceptional customer feedback on BMW repair quality",
    status: "reviewed" as const,
  },
  {
    id: "2",
    date: "Feb 3, 2026",
    employee: "Jake Thompson",
    type: "review" as const,
    summary: "Quarterly performance review - meets expectations",
    status: "closed" as const,
  },
  {
    id: "3",
    date: "Feb 1, 2026",
    employee: "Derek Kim",
    type: "incident" as const,
    summary: "Late arrival - traffic accident on highway",
    status: "pending" as const,
  },
  {
    id: "4",
    date: "Jan 28, 2026",
    employee: "Carlos Mendez",
    type: "warning" as const,
    summary: "Safety protocol reminder - PPE compliance",
    status: "reviewed" as const,
  },
];

const Index = () => {
  const { data: stats, isLoading: statsLoading, isError: statsError } = useDashboardStats();

  const daily = stats?.daily;
  const weekly = stats?.weekly;
  const monthly = stats?.monthly;

  const todayRevenue = daily ? `$${daily.current.toLocaleString()}` : statsLoading ? "…" : "$0";
  const todayRemain =
    daily && daily.goal > 0 ? `$${Math.max(0, daily.goal - daily.current).toLocaleString()} to goal` : "Set revenue under data entry";

  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <h1 className="page-header">Dashboard Overview</h1>
        <p className="text-muted-foreground mt-1">
          Boltz Automotive — here is what is happening at the shop today.
        </p>
        {statsError && (
          <p className="text-sm text-destructive mt-2">
            Could not load live stats. Confirm the database migration is applied and you are signed in.
          </p>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard
          title="Active profiles"
          value={statsLoading ? "…" : String(stats?.activeMechanics ?? 0)}
          subtitle="Active team members in directory"
          icon={<Users className="w-5 h-5 text-primary" />}
          variant="primary"
          trend={{ value: 0, label: "live from Supabase" }}
        />
        <MetricCard
          title="Jobs In Progress"
          value={statsLoading ? "…" : String(stats?.jobsInProgress ?? 0)}
          subtitle="Open WIP jobs"
          icon={<Wrench className="w-5 h-5 text-accent" />}
          variant="accent"
          trend={{ value: 0, label: "live from Supabase" }}
        />
        <MetricCard
          title="Today's Revenue"
          value={todayRevenue}
          subtitle={todayRemain}
          icon={<DollarSign className="w-5 h-5 text-success" />}
          variant="success"
          trend={{ value: 0, label: "from revenue entries" }}
        />
        <MetricCard
          title="Avg Completion Time"
          value="—"
          subtitle="Per job (coming with job analytics)"
          icon={<Clock className="w-5 h-5 text-warning" />}
          variant="warning"
          trend={{ value: 0, label: "placeholder" }}
        />
      </div>

      {/* Revenue Goals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        <RevenueGoalCard
          title="Daily Goal"
          current={daily?.current ?? 0}
          goal={daily?.goal ?? 1}
          period="daily"
        />
        <RevenueGoalCard
          title="Weekly Goal"
          current={weekly?.current ?? 0}
          goal={weekly?.goal ?? 1}
          period="weekly"
        />
        <RevenueGoalCard
          title="Monthly Goal"
          current={monthly?.current ?? 0}
          goal={monthly?.goal ?? 1}
          period="monthly"
        />
      </div>

      {/* Charts and Bonus Tracker */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        <div className="lg:col-span-2">
          <JobMetricsChart data={jobMetricsData} />
        </div>
        <BonusTracker currentRevenue={monthly?.current ?? 0} tiers={bonusTiers} />
      </div>

      {/* Technician Cards */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Technician Performance</h2>
          <Link to="/technicians" className="text-sm text-primary hover:underline">
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {technicians.map((tech) => (
            <TechnicianCard key={tech.name} {...tech} />
          ))}
        </div>
      </div>

      {/* Performance Documentation */}
      <PerformanceTable records={performanceRecords} />
    </>
  );
};

export default Index;
