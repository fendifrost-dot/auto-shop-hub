import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRoles } from "@/hooks/useUserRoles";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type Job = any;
type JobStatus = string;

export default function Jobs() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data: roles = [] } = useUserRoles();
  const canManage = roles.includes("admin") || roles.includes("manager");

  const jobsQuery = useQuery({
    queryKey: ["jobs_list"],
    queryFn: async () => {
      const { data, error } = await (supabase.from as any)("jobs").select("*").order("created_at", { ascending: false }).limit(200);
      if (error) throw error;
      return data as Job[];
    },
  });

  const profilesQuery = useQuery({
    queryKey: ["profiles_picklist"],
    queryFn: async () => {
      const { data, error } = await (supabase.from as any)("profiles").select("user_id, full_name, email").eq("is_active", true);
      if (error) throw error;
      return data ?? [];
    },
    enabled: canManage,
  });

  const [open, setOpen] = useState(false);
  const [jobNumber, setJobNumber] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [vehicleInfo, setVehicleInfo] = useState("");
  const [description, setDescription] = useState("");
  const [assignedTo, setAssignedTo] = useState<string>("__none__");

  const createJob = useMutation({
    mutationFn: async () => {
      const payload = {
        job_number: jobNumber.trim(),
        customer_name: customerName.trim() || null,
        vehicle_info: vehicleInfo.trim() || null,
        description: description.trim() || null,
        assigned_to: assignedTo !== "__none__" ? assignedTo : null,
        status: "pending" as JobStatus,
      };
      const { error } = await (supabase.from as any)("jobs").insert(payload);
      if (error) throw error;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["jobs_list"] });
      await qc.invalidateQueries({ queryKey: ["time_clock", "jobs_picklist"] });
      setOpen(false);
      setJobNumber(""); setCustomerName(""); setVehicleInfo(""); setDescription(""); setAssignedTo("__none__");
      toast.success("Job created");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not create job"),
  });

  const visibleJobs = jobsQuery.data?.filter((j: any) => canManage || j.assigned_to === user?.id) ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-header">Job tracking</h1>
          <p className="text-muted-foreground mt-1">Open jobs, assignments, and status.</p>
        </div>
        {canManage && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4" /> New job</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Create job</DialogTitle>
                <DialogDescription>Job numbers must be unique.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-3 py-2">
                <div className="space-y-2"><Label htmlFor="jobNumber">Job number</Label><Input id="jobNumber" value={jobNumber} onChange={(e) => setJobNumber(e.target.value)} placeholder="e.g. 2026-1042" /></div>
                <div className="space-y-2"><Label htmlFor="customer">Customer</Label><Input id="customer" value={customerName} onChange={(e) => setCustomerName(e.target.value)} /></div>
                <div className="space-y-2"><Label htmlFor="vehicle">Vehicle</Label><Input id="vehicle" value={vehicleInfo} onChange={(e) => setVehicleInfo(e.target.value)} /></div>
                <div className="space-y-2"><Label htmlFor="desc">Description</Label><Input id="desc" value={description} onChange={(e) => setDescription(e.target.value)} /></div>
                <div className="space-y-2">
                  <Label>Assign to</Label>
                  <Select value={assignedTo} onValueChange={setAssignedTo}>
                    <SelectTrigger><SelectValue placeholder={profilesQuery.isLoading ? "Loading…" : "Unassigned"} /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">Unassigned</SelectItem>
                      {(profilesQuery.data ?? []).map((p: any) => (
                        <SelectItem key={p.user_id} value={p.user_id}>{p.full_name || p.email || p.user_id}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={() => void createJob.mutateAsync()} disabled={!jobNumber.trim() || createJob.isPending}>
                  {createJob.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Jobs</CardTitle>
          <CardDescription>{canManage ? "All shop jobs." : "Jobs assigned to you."}</CardDescription>
        </CardHeader>
        <CardContent>
          {jobsQuery.isLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Job #</TableHead><TableHead>Customer</TableHead><TableHead>Vehicle</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Revenue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visibleJobs.length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="text-muted-foreground">No jobs yet.</TableCell></TableRow>
                  ) : (
                    visibleJobs.map((j: any) => (
                      <TableRow key={j.id}>
                        <TableCell className="font-medium">{j.job_number}</TableCell>
                        <TableCell>{j.customer_name ?? "—"}</TableCell>
                        <TableCell className="max-w-[200px] truncate">{j.vehicle_info ?? "—"}</TableCell>
                        <TableCell className="capitalize">{j.status?.replace("_", " ")}</TableCell>
                        <TableCell className="text-right">{j.revenue != null ? `$${Number(j.revenue).toLocaleString()}` : "—"}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
