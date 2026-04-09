import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import type { Database } from "@/integrations/supabase/types";

type PeriodType = Database["public"]["Enums"]["revenue_period_type"];

export default function Revenue() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const listQuery = useQuery({
    queryKey: ["revenue_entries_list"],
    queryFn: async () => {
      const { data, error } = await supabase.from("revenue_entries").select("*").order("period_end", { ascending: false }).limit(50);
      if (error) throw error;
      return data ?? [];
    },
  });

  const [periodType, setPeriodType] = useState<PeriodType>("weekly");
  const [periodStart, setPeriodStart] = useState("");
  const [periodEnd, setPeriodEnd] = useState("");
  const [revenueAmount, setRevenueAmount] = useState("");
  const [goalAmount, setGoalAmount] = useState("");
  const [marginPercent, setMarginPercent] = useState("");
  const [notes, setNotes] = useState("");

  const save = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("Not signed in");
      const { error } = await supabase.from("revenue_entries").insert({
        period_type: periodType,
        period_start: periodStart,
        period_end: periodEnd,
        revenue_amount: Number(revenueAmount),
        goal_amount: Number(goalAmount),
        margin_percent: marginPercent ? Number(marginPercent) : null,
        entered_by: user.id,
        notes: notes.trim() || null,
      });
      if (error) throw error;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["revenue_entries_list"] });
      await qc.invalidateQueries({ queryKey: ["dashboard_stats"] });
      toast.success("Revenue entry saved");
      setNotes("");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not save"),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-header">Revenue &amp; goals</h1>
        <p className="text-muted-foreground mt-1">Log weekly or monthly revenue so the dashboard reflects real numbers.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>New entry</CardTitle>
          <CardDescription>Use non-overlapping ranges per period type.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 py-2 max-w-xl">
          <div className="space-y-2">
            <Label>Period type</Label>
            <Select value={periodType} onValueChange={(v) => setPeriodType(v as PeriodType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="ps">Start</Label>
              <Input id="ps" type="date" value={periodStart} onChange={(e) => setPeriodStart(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pe">End</Label>
              <Input id="pe" type="date" value={periodEnd} onChange={(e) => setPeriodEnd(e.target.value)} />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="rev">Revenue ($)</Label>
              <Input id="rev" inputMode="decimal" value={revenueAmount} onChange={(e) => setRevenueAmount(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="goal">Goal ($)</Label>
              <Input id="goal" inputMode="decimal" value={goalAmount} onChange={(e) => setGoalAmount(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="margin">Margin % (optional)</Label>
            <Input id="margin" inputMode="decimal" value={marginPercent} onChange={(e) => setMarginPercent(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="n">Notes</Label>
            <Textarea id="n" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
          </div>
          <Button
            onClick={() => void save.mutateAsync()}
            disabled={
              save.isPending ||
              !periodStart ||
              !periodEnd ||
              revenueAmount === "" ||
              goalAmount === ""
            }
          >
            {save.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save entry"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent entries</CardTitle>
        </CardHeader>
        <CardContent>
          {listQuery.isLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading…
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Range</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Goal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(listQuery.data ?? []).length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-muted-foreground">
                        No entries yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    listQuery.data?.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell className="capitalize">{r.period_type}</TableCell>
                        <TableCell>
                          {r.period_start} → {r.period_end}
                        </TableCell>
                        <TableCell>${Number(r.revenue_amount).toLocaleString()}</TableCell>
                        <TableCell>${Number(r.goal_amount).toLocaleString()}</TableCell>
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
