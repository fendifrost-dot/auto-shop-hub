import { useMemo, useState } from "react";
import { format, formatDistanceToNow } from "date-fns";
import { Loader2, Play, Square, Briefcase, Coffee } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTimeClock, type IdleCategory } from "@/hooks/useTimeClock";

const IDLE_OPTIONS: { value: IdleCategory; label: string }[] = [
  { value: "cleanup", label: "Cleanup" },
  { value: "meeting", label: "Meeting" },
  { value: "waiting_parts", label: "Waiting on parts" },
  { value: "training", label: "Training" },
  { value: "break", label: "Break" },
  { value: "other", label: "Other" },
];

export default function TimeClock() {
  const {
    activeShift, activeSlice, jobs, isLoading, jobsLoading,
    clockIn, clockOut, startJobSlice, startIdleSlice,
  } = useTimeClock();

  const [jobId, setJobId] = useState<string>("");
  const [idleCategory, setIdleCategory] = useState<IdleCategory>("break");

  const shiftStartedLabel = useMemo(() => {
    if (!activeShift?.clock_in) return null;
    return formatDistanceToNow(new Date(activeShift.clock_in), { addSuffix: true });
  }, [activeShift?.clock_in]);

  async function handleClockIn() {
    try { await clockIn.mutateAsync(); toast.success("Clocked in"); }
    catch (e) { toast.error(e instanceof Error ? e.message : "Could not clock in"); }
  }

  async function handleClockOut() {
    if (!activeShift) return;
    try { await clockOut.mutateAsync(activeShift.id); toast.success("Clocked out"); }
    catch (e) { toast.error(e instanceof Error ? e.message : "Could not clock out"); }
  }

  async function handleStartJob() {
    if (!activeShift || !jobId) { toast.error("Pick a job first"); return; }
    try { await startJobSlice.mutateAsync({ timeEntryId: activeShift.id, jobId }); toast.success("Job time started"); setJobId(""); }
    catch (e) { toast.error(e instanceof Error ? e.message : "Could not start job time"); }
  }

  async function handleStartIdle() {
    if (!activeShift) return;
    try { await startIdleSlice.mutateAsync({ timeEntryId: activeShift.id, category: idleCategory }); toast.success("Idle time logged"); }
    catch (e) { toast.error(e instanceof Error ? e.message : "Could not log idle"); }
  }

  if (isLoading) {
    return <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" /> Loading time clock…</div>;
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="page-header">Time clock</h1>
        <p className="text-muted-foreground mt-1">Clock in, run jobs, and log idle time — built for phone use.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Shift</CardTitle>
          <CardDescription>
            {activeShift
              ? `On shift — started ${shiftStartedLabel ?? ""} (${format(new Date(activeShift.clock_in), "PPpp")})`
              : "You are not clocked in."}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-3">
          {!activeShift ? (
            <Button size="lg" className="w-full sm:flex-1 h-14 text-lg" onClick={() => void handleClockIn()} disabled={clockIn.isPending}>
              {clockIn.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Play className="h-5 w-5" />} Clock in
            </Button>
          ) : (
            <Button size="lg" variant="secondary" className="w-full sm:flex-1 h-14 text-lg" onClick={() => void handleClockOut()} disabled={clockOut.isPending}>
              {clockOut.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Square className="h-5 w-5" />} Clock out
            </Button>
          )}
        </CardContent>
      </Card>

      {activeShift && (
        <Card>
          <CardHeader>
            <CardTitle>Current activity</CardTitle>
            <CardDescription>
              {activeSlice?.is_idle
                ? `Idle — ${activeSlice.idle_category?.replace("_", " ") ?? "unspecified"}`
                : activeSlice?.jobs
                  ? `${activeSlice.jobs.job_number} · ${activeSlice.jobs.customer_name ?? "Customer"}`
                  : "No job or idle slice started yet — pick a job or log idle."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Switch to job</Label>
              <div className="flex flex-col sm:flex-row gap-2">
                <Select value={jobId} onValueChange={setJobId} disabled={jobsLoading}>
                  <SelectTrigger className="w-full"><SelectValue placeholder={jobsLoading ? "Loading jobs…" : "Select job"} /></SelectTrigger>
                  <SelectContent>
                    {jobs.map((j: any) => (<SelectItem key={j.id} value={j.id}>{j.job_number} — {j.customer_name ?? "Customer"}</SelectItem>))}
                  </SelectContent>
                </Select>
                <Button className="sm:w-auto w-full" onClick={() => void handleStartJob()} disabled={!jobId || startJobSlice.isPending}>
                  {startJobSlice.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Briefcase className="h-4 w-4" />} Start job time
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Log idle time</Label>
              <div className="flex flex-col sm:flex-row gap-2">
                <Select value={idleCategory} onValueChange={(v) => setIdleCategory(v as IdleCategory)}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {IDLE_OPTIONS.map((opt) => (<SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>))}
                  </SelectContent>
                </Select>
                <Button variant="outline" className="sm:w-auto w-full" onClick={() => void handleStartIdle()} disabled={startIdleSlice.isPending}>
                  {startIdleSlice.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Coffee className="h-4 w-4" />} Start idle
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
