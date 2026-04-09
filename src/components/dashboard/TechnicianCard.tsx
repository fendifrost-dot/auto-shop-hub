import { cn } from "@/lib/utils";
import { Star, Clock, CheckCircle2, AlertCircle, DollarSign } from "lucide-react";

interface TechnicianCardProps {
  name: string;
  role: string;
  avatar?: string;
  jobsCompleted: number;
  hoursWorked: number;
  efficiency: number;
  revenue: number;
  status: "active" | "break" | "off";
}

export function TechnicianCard({
  name,
  role,
  avatar,
  jobsCompleted,
  hoursWorked,
  efficiency,
  revenue,
  status,
}: TechnicianCardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const getStatusBadge = () => {
    switch (status) {
      case "active":
        return (
          <span className="badge-success flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            Active
          </span>
        );
      case "break":
        return (
          <span className="badge-warning flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Break
          </span>
        );
      case "off":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
            Off
          </span>
        );
    }
  };

  const getEfficiencyColor = () => {
    if (efficiency >= 90) return "text-success";
    if (efficiency >= 70) return "text-warning";
    return "text-destructive";
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className="metric-card hover:border-primary/30">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-semibold">
            {avatar ? (
              <img src={avatar} alt={name} className="w-12 h-12 rounded-full object-cover" />
            ) : (
              getInitials(name)
            )}
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{name}</h3>
            <p className="text-sm text-muted-foreground">{role}</p>
          </div>
        </div>
        {getStatusBadge()}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="flex items-center gap-1 text-muted-foreground mb-0.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span className="text-[11px] uppercase tracking-wider">Jobs</span>
          </div>
          <p className="text-lg font-bold">{jobsCompleted}</p>
        </div>

        <div>
          <div className="flex items-center gap-1 text-muted-foreground mb-0.5">
            <Clock className="w-3.5 h-3.5" />
            <span className="text-[11px] uppercase tracking-wider">Hours</span>
          </div>
          <p className="text-lg font-bold">{hoursWorked}h</p>
        </div>

        <div>
          <div className="flex items-center gap-1 text-muted-foreground mb-0.5">
            <Star className="w-3.5 h-3.5" />
            <span className="text-[11px] uppercase tracking-wider">Efficiency</span>
          </div>
          <p className={cn("text-lg font-bold", getEfficiencyColor())}>{efficiency}%</p>
        </div>

        <div>
          <div className="flex items-center gap-1 text-muted-foreground mb-0.5">
            <DollarSign className="w-3.5 h-3.5" />
            <span className="text-[11px] uppercase tracking-wider">Revenue</span>
          </div>
          <p className="text-lg font-bold text-primary">{formatCurrency(revenue)}</p>
        </div>
      </div>
    </div>
  );
}
