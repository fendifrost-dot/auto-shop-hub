import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { AppRole } from "@/hooks/useUserRoles";

type ProfileRow = { user_id: string; full_name: string; email: string | null };
type RoleRow = { user_id: string; role: AppRole; id: string };

const ROLE_OPTIONS: { value: AppRole; label: string }[] = [
  { value: "mechanic", label: "Mechanic" },
  { value: "manager", label: "Manager" },
  { value: "admin", label: "Admin" },
];

export default function Settings() {
  const qc = useQueryClient();

  const profilesQuery = useQuery({
    queryKey: ["settings_profiles"],
    queryFn: async () => {
      const { data, error } = await (supabase.from as any)("profiles").select("user_id, full_name, email").order("full_name");
      if (error) throw error;
      return (data ?? []) as ProfileRow[];
    },
  });

  const rolesQuery = useQuery({
    queryKey: ["settings_roles"],
    queryFn: async () => {
      const { data, error } = await (supabase.from as any)("user_roles").select("id, user_id, role");
      if (error) throw error;
      return (data ?? []) as RoleRow[];
    },
  });

  const rolesByUser = (rolesQuery.data ?? []).reduce<Record<string, AppRole[]>>((acc, row) => {
    acc[row.user_id] = acc[row.user_id] ?? [];
    acc[row.user_id].push(row.role);
    return acc;
  }, {});

  const addRole = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: AppRole }) => {
      const { error } = await (supabase.from as any)("user_roles").insert({ user_id: userId, role });
      if (error) throw error;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["settings_roles"] });
      await qc.invalidateQueries({ queryKey: ["user_roles"] });
      toast.success("Role assigned");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not assign role"),
  });

  const removeRole = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: AppRole }) => {
      const { error } = await (supabase.from as any)("user_roles").delete().eq("user_id", userId).eq("role", role);
      if (error) throw error;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["settings_roles"] });
      await qc.invalidateQueries({ queryKey: ["user_roles"] });
      toast.success("Role removed");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not remove role"),
  });

  const [pendingAdd, setPendingAdd] = useState<Record<string, AppRole | "">>({});

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-header">Settings</h1>
        <p className="text-muted-foreground mt-1">Assign shop roles so people can use the app.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" /> Roles</CardTitle>
          <CardDescription>Admins only. New signups stay on the access-pending screen until a role is added.</CardDescription>
        </CardHeader>
        <CardContent>
          {profilesQuery.isLoading || rolesQuery.isLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow><TableHead>Person</TableHead><TableHead>Email</TableHead><TableHead>Current roles</TableHead><TableHead className="w-[220px]">Add role</TableHead></TableRow>
                </TableHeader>
                <TableBody>
                  {(profilesQuery.data ?? []).map((p) => {
                    const current = rolesByUser[p.user_id] ?? [];
                    const addValue = pendingAdd[p.user_id] ?? "";
                    return (
                      <TableRow key={p.user_id}>
                        <TableCell className="font-medium">{p.full_name || "—"}</TableCell>
                        <TableCell className="text-muted-foreground">{p.email ?? "—"}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {current.length === 0 ? (
                              <span className="text-muted-foreground text-sm">None</span>
                            ) : (
                              current.map((r) => (
                                <Button key={r} type="button" variant="secondary" size="sm" className="h-7"
                                  onClick={() => void removeRole.mutateAsync({ userId: p.user_id, role: r })} disabled={removeRole.isPending}>
                                  {r} ✕
                                </Button>
                              ))
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Select value={addValue} onValueChange={(v) => setPendingAdd((s) => ({ ...s, [p.user_id]: v as AppRole }))}>
                              <SelectTrigger className="h-9"><SelectValue placeholder="Pick role" /></SelectTrigger>
                              <SelectContent>
                                {ROLE_OPTIONS.map((opt) => (
                                  <SelectItem key={opt.value} value={opt.value} disabled={current.includes(opt.value)}>{opt.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Button type="button" size="sm" disabled={!addValue || addRole.isPending}
                              onClick={() => {
                                const role = pendingAdd[p.user_id] as AppRole;
                                if (!role) return;
                                void addRole.mutateAsync({ userId: p.user_id, role }).then(() => {
                                  setPendingAdd((s) => ({ ...s, [p.user_id]: "" }));
                                });
                              }}>Add</Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
