import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type DashboardStats = {
  jobsInProgress: number;
  activeMechanics: number;
  daily: { current: number; goal: number } | null;
  weekly: { current: number; goal: number } | null;
  monthly: { current: number; goal: number } | null;
};

export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard_stats"],
    queryFn: async (): Promise<DashboardStats> => {
      const [jobsRes, profilesRes, revenueRes] = await Promise.all([
        (supabase.from as any)("jobs").select("id", { count: "exact", head: true }).eq("status", "in_progress"),
        (supabase.from as any)("profiles").select("id", { count: "exact", head: true }).eq("is_active", true),
        (supabase.from as any)("revenue_entries").select("*").order("period_end", { ascending: false }).limit(12),
      ]);

      if (jobsRes.error) throw jobsRes.error;
      if (profilesRes.error) throw profilesRes.error;
      if (revenueRes.error) throw revenueRes.error;

      const rows = revenueRes.data ?? [];

      const pick = (type: "daily" | "weekly" | "monthly") => {
        const candidates = rows
          .filter((r: any) => r.period_type === type)
          .sort((a: any, b: any) => new Date(b.period_end).getTime() - new Date(a.period_end).getTime());
        const hit = candidates[0];
        if (!hit) return null;
        return {
          current: Number(hit.revenue_amount),
          goal: Number(hit.goal_amount),
        };
      };

      return {
        jobsInProgress: jobsRes.count ?? 0,
        activeMechanics: profilesRes.count ?? 0,
        daily: pick("daily"),
        weekly: pick("weekly"),
        monthly: pick("monthly"),
      };
    },
  });
}
