import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

type TimeEntry = any;
type JobTimeEntry = any;
type Job = any;
export type IdleCategory = "cleanup" | "meeting" | "waiting_parts" | "training" | "break" | "other";

export function useTimeClock() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const uid = user?.id;

  const activeShiftQuery = useQuery({
    queryKey: ["time_clock", "active_shift", uid],
    enabled: !!uid,
    queryFn: async () => {
      const { data, error } = await (supabase.from as any)("time_entries")
        .select("*")
        .eq("user_id", uid!)
        .is("clock_out", null)
        .order("clock_in", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data as TimeEntry | null;
    },
  });

  const activeSliceQuery = useQuery({
    queryKey: ["time_clock", "active_slice", activeShiftQuery.data?.id],
    enabled: !!activeShiftQuery.data?.id,
    queryFn: async () => {
      const shiftId = activeShiftQuery.data!.id;
      const { data: slice, error } = await (supabase.from as any)("job_time_entries")
        .select("*")
        .eq("time_entry_id", shiftId)
        .is("end_time", null)
        .order("start_time", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      if (!slice) return null;

      let job: Job | null = null;
      if (slice.job_id) {
        const { data: jobRow, error: jobErr } = await (supabase.from as any)("jobs").select("*").eq("id", slice.job_id).single();
        if (jobErr) throw jobErr;
        job = jobRow;
      }

      return { ...slice, jobs: job };
    },
  });

  const jobsQuery = useQuery({
    queryKey: ["time_clock", "jobs_picklist", uid],
    enabled: !!uid,
    queryFn: async () => {
      const { data, error } = await (supabase.from as any)("jobs")
        .select("*")
        .in("status", ["pending", "in_progress"])
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      return (data ?? []) as Job[];
    },
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["time_clock"] });
  };

  const clockIn = useMutation({
    mutationFn: async () => {
      const { data, error } = await (supabase.from as any)("time_entries")
        .insert({ user_id: uid!, status: "active" })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: invalidate,
  });

  const clockOut = useMutation({
    mutationFn: async (timeEntryId: string) => {
      const now = new Date().toISOString();

      const { error: sliceErr } = await (supabase.from as any)("job_time_entries")
        .update({ end_time: now, updated_at: now })
        .eq("time_entry_id", timeEntryId)
        .is("end_time", null);

      if (sliceErr) throw sliceErr;

      const { error } = await (supabase.from as any)("time_entries")
        .update({ clock_out: now, status: "completed", updated_at: now })
        .eq("id", timeEntryId);

      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const startJobSlice = useMutation({
    mutationFn: async (payload: { timeEntryId: string; jobId: string }) => {
      const now = new Date().toISOString();

      const { error: closeErr } = await (supabase.from as any)("job_time_entries")
        .update({ end_time: now, updated_at: now })
        .eq("time_entry_id", payload.timeEntryId)
        .is("end_time", null);

      if (closeErr) throw closeErr;

      const { error } = await (supabase.from as any)("job_time_entries").insert({
        time_entry_id: payload.timeEntryId,
        user_id: uid!,
        job_id: payload.jobId,
        start_time: now,
        is_idle: false,
      });

      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const startIdleSlice = useMutation({
    mutationFn: async (payload: { timeEntryId: string; category: IdleCategory }) => {
      const now = new Date().toISOString();

      const { error: closeErr } = await (supabase.from as any)("job_time_entries")
        .update({ end_time: now, updated_at: now })
        .eq("time_entry_id", payload.timeEntryId)
        .is("end_time", null);

      if (closeErr) throw closeErr;

      const { error } = await (supabase.from as any)("job_time_entries").insert({
        time_entry_id: payload.timeEntryId,
        user_id: uid!,
        job_id: null,
        start_time: now,
        is_idle: true,
        idle_category: payload.category,
      });

      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  return {
    activeShift: activeShiftQuery.data,
    activeSlice: activeSliceQuery.data,
    jobs: jobsQuery.data ?? [],
    isLoading: activeShiftQuery.isLoading || activeSliceQuery.isLoading,
    jobsLoading: jobsQuery.isLoading,
    refetch: activeShiftQuery.refetch,
    clockIn,
    clockOut,
    startJobSlice,
    startIdleSlice,
  };
}
