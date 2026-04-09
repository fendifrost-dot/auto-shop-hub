import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
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
import { Textarea } from "@/components/ui/textarea";

type PerfType = "commendation" | "review" | "incident" | "warning";

const TYPES: { value: PerfType; label: string }[] = [
  { value: "commendation", label: "Commendation" },
  { value: "review", label: "Review" },
  { value: "incident", label: "Incident" },
  { value: "warning", label: "Warning" },
];

export default function Performance() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data: roles = [] } = useUserRoles();
  const canManage = roles.includes("admin") || roles.includes("manager");

  const recordsQuery = useQuery({
    queryKey: ["performance_records"],
    queryFn: async () => {
      const { data, error } = await (supabase.from as any)("performance_records")
        .select("*").order("date", { ascending: false }).limit(200);
      if (error) throw error;
      return data as any[];
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
  const [employeeId, setEmployeeId] = useState("");
  const [type, setType] = useState<PerfType>("commendation");
  const [summary, setSummary] = useState("");
  const [details, setDetails] = useState("");
  const [recordDate, setRecordDate] = useState(() => format(new Date(), "yyyy-MM-dd"));

  const createRecord = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("Not signed in");
      const { error } = await (supabase.from as any)("performance_records").insert({
        user_id: employeeId, recorded_by: user.id, type, summary: summary.trim(),
        details: details.trim() || null, date: recordDate, status: "pending",
      });
      if (error) throw error;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["performance_records"] });
      setOpen(false); setEmployeeId(""); setSummary(""); setDetails(""); setType("commendation");
      setRecordDate(format(new Date(), "yyyy-MM-dd"));
      toast.success("Record saved");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not save"),
  });

  const visible = (recordsQuery.data ?? []).filter((r: any) => canManage || r.user_id === user?.id);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-header">Performance</h1>
          <p className="text-muted-foreground mt-1">Documentation that builds morale and clarity.</p>
        </div>
        {canManage && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button><Plus className="h-4 w-4" /> Log record</Button></DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>New performance record</DialogTitle>
                <DialogDescription>Visible to the employee for their own entries.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-3 py-2">
                <div className="space-y-2">
                  <Label>Employee</Label>
                  <Select value={employeeId} onValueChange={setEmployeeId}>
                    <SelectTrigger><SelectValue placeholder="Select employee" /></SelectTrigger>
                    <SelectContent>
                      {(profilesQuery.data ?? []).map((p: any) => (
                        <SelectItem key={p.user_id} value={p.user_id}>{p.full_name || p.email || p.user_id}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={type} onValueChange={(v) => setType(v as PerfType)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{TYPES.map((t) => (<SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>))}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label htmlFor="pdate">Date</Label><Input id="pdate" type="date" value={recordDate} onChange={(e) => setRecordDate(e.target.value)} /></div>
                <div className="space-y-2"><Label htmlFor="sum">Summary</Label><Input id="sum" value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="Short headline" /></div>
                <div className="space-y-2"><Label htmlFor="det">Details</Label><Textarea id="det" value={details} onChange={(e) => setDetails(e.target.value)} rows={3} /></div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={() => void createRecord.mutateAsync()} disabled={!employeeId || !summary.trim() || createRecord.isPending}>
                  {createRecord.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card>
        <CardHeader><CardTitle>Records</CardTitle><CardDescription>{canManage ? "Shop-wide records." : "Your records."}</CardDescription></CardHeader>
        <CardContent>
          {recordsQuery.isLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Type</TableHead><TableHead>Summary</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
                <TableBody>
                  {visible.length === 0 ? (
                    <TableRow><TableCell colSpan={4} className="text-muted-foreground">No records yet.</TableCell></TableRow>
                  ) : (
                    visible.map((r: any) => (
                      <TableRow key={r.id}>
                        <TableCell>{r.date}</TableCell>
                        <TableCell className="capitalize">{r.type}</TableCell>
                        <TableCell className="max-w-[320px]">{r.summary}</TableCell>
                        <TableCell className="capitalize">{r.status}</TableCell>
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
