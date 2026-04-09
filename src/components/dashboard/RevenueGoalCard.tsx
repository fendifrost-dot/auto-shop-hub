import { cn } from "@/lib/utils";
import { Target } from "lucide-react";

interface RevenueGoalCardProps {
  title: string;
  current: number;
  goal: number;
  period: "daily" | "weekly" | "monthly";
}

export function RevenueGoalCard({ title, current, goal, period }: RevenueGoalCardProps) {
  const safeGoal = goal > 0 ? goal : 1;
  const percentage = Math.min((current / safeGoal) * 100, 100);
  const remaining = goal - current;
  
  const periodColors = {
    daily: "bg-primary",
    weekly: "bg-accent",
    monthly: "bg-success",
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="metric-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          <span className="font-semibold text-foreground">{title}</span>
        </div>
        <span className={cn(
          "px-2.5 py-1 rounded-full text-xs font-medium capitalize",
          period === "daily" && "bg-primary/10 text-primary",
          period === "weekly" && "bg-accent/10 text-accent",
          period === "monthly" && "bg-success/10 text-success"
        )}>
          {period}
        </span>
      </div>

      <div className="space-y-3">
        <div className="flex items-baseline justify-between">
          <span className="stat-value">{formatCurrency(current)}</span>
          <span className="text-sm text-muted-foreground">of {formatCurrency(goal)}</span>
        </div>

        <div className="progress-bar">
          <div
            className={cn("progress-fill", periodColors[period])}
            style={{ width: `${percentage}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-foreground">{percentage.toFixed(1)}% achieved</span>
          {remaining > 0 ? (
            <span className="text-muted-foreground">{formatCurrency(remaining)} to go</span>
          ) : (
            <span className="text-success font-medium">Goal reached! 🎉</span>
          )}
        </div>
      </div>
    </div>
  );
}
