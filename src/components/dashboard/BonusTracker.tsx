import { cn } from "@/lib/utils";
import { Trophy, ArrowRight } from "lucide-react";

interface BonusTier {
  name: string;
  threshold: number;
  bonus: number;
  achieved: boolean;
}

interface BonusTrackerProps {
  currentRevenue: number;
  tiers: BonusTier[];
}

export function BonusTracker({ currentRevenue, tiers }: BonusTrackerProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const sortedTiers = [...tiers].sort((a, b) => a.threshold - b.threshold);
  const nextTier = sortedTiers.find((tier) => !tier.achieved);
  const achievedTiers = sortedTiers.filter((tier) => tier.achieved);
  const totalEarned = achievedTiers.reduce((sum, tier) => sum + tier.bonus, 0);

  return (
    <div className="metric-card">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-accent" />
          <h3 className="font-semibold text-foreground">Bonus Progress</h3>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Total Earned</p>
          <p className="text-lg font-bold text-accent">{formatCurrency(totalEarned)}</p>
        </div>
      </div>

      <div className="space-y-3">
        {sortedTiers.map((tier, index) => {
          const progress = Math.min((currentRevenue / tier.threshold) * 100, 100);
          
          return (
            <div
              key={tier.name}
              className={cn(
                "p-3 rounded-lg border transition-all",
                tier.achieved 
                  ? "bg-success/5 border-success/30" 
                  : "bg-muted/30 border-border"
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                    tier.achieved 
                      ? "bg-success text-success-foreground" 
                      : "bg-muted text-muted-foreground"
                  )}>
                    {tier.achieved ? "✓" : index + 1}
                  </span>
                  <span className={cn(
                    "font-medium",
                    tier.achieved ? "text-success" : "text-foreground"
                  )}>
                    {tier.name}
                  </span>
                </div>
                <span className={cn(
                  "font-bold",
                  tier.achieved ? "text-success" : "text-muted-foreground"
                )}>
                  +{formatCurrency(tier.bonus)}
                </span>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="flex-1 progress-bar h-1.5">
                  <div
                    className={cn(
                      "progress-fill",
                      tier.achieved ? "bg-success" : "bg-primary"
                    )}
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {formatCurrency(tier.threshold)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {nextTier && (
        <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {formatCurrency(nextTier.threshold - currentRevenue)} to next bonus
          </span>
          <span className="flex items-center gap-1 text-sm font-medium text-primary">
            {nextTier.name} <ArrowRight className="w-4 h-4" />
          </span>
        </div>
      )}
    </div>
  );
}
