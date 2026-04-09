import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
  trend?: {
    value: number;
    label: string;
  };
  icon?: ReactNode;
  variant?: "default" | "primary" | "success" | "warning" | "accent";
  className?: string;
}

const variantStyles = {
  default: "",
  primary: "border-l-4 border-l-primary",
  success: "border-l-4 border-l-success",
  warning: "border-l-4 border-l-warning",
  accent: "border-l-4 border-l-accent",
};

export function MetricCard({
  title,
  value,
  subtitle,
  trend,
  icon,
  variant = "default",
  className,
}: MetricCardProps) {
  const getTrendIcon = () => {
    if (!trend) return null;
    if (trend.value > 0) return <TrendingUp className="w-4 h-4 text-success" />;
    if (trend.value < 0) return <TrendingDown className="w-4 h-4 text-destructive" />;
    return <Minus className="w-4 h-4 text-muted-foreground" />;
  };

  const getTrendColor = () => {
    if (!trend) return "";
    if (trend.value > 0) return "text-success";
    if (trend.value < 0) return "text-destructive";
    return "text-muted-foreground";
  };

  return (
    <div className={cn("metric-card", variantStyles[variant], className)}>
      <div className="flex items-start justify-between mb-3">
        <span className="stat-label">{title}</span>
        {icon && (
          <div className="p-2 rounded-lg bg-muted">
            {icon}
          </div>
        )}
      </div>
      
      <div className="space-y-1">
        <p className="stat-value">{value}</p>
        {subtitle && (
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>

      {trend && (
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
          {getTrendIcon()}
          <span className={cn("text-sm font-medium", getTrendColor())}>
            {trend.value > 0 ? "+" : ""}{trend.value}%
          </span>
          <span className="text-sm text-muted-foreground">{trend.label}</span>
        </div>
      )}
    </div>
  );
}
