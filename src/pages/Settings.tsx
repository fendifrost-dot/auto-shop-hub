import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AlertCircle, Loader2, Shield, UserX } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { AppRole } from "@/hooks/useUserRoles";

type ProfileRow = { user_id: string; full_name: string; email: string | null };
type RoleRow = { user_id: string; role: AppRole; id: string };

const ROLE_OPTIONS: { value: AppRole; label: string; description: string }[] = [
  { value: "mechanic", label: "Mechanic", description: "Personal metrics, time clock, job view" },
  { value: "manager", label: "Manager", description: "Revenue, job editing, time approval" },
  { value: "admin", label: "Admin", description: "Full control, settings, pay" },
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
  const [confirmRemove, setConfirmRemove] = useState<{ userId: string; role: AppRole; name: string } | null>(null);

  const isLoading = profilesQuery.isLoading || rolesQuery.isLoading;
  const isError = profilesQuery.isError || rolesQuery.isError;
  const profiles = profilesQuery.data ?? [];
  const pendingUsers = profiles.filter((p) => (rolesByUser[p.user_id] ?? []).length === 0);
  const activeUsers = profiles.filter((p) => (rolesByUser[p.user_id] ?? []).length > 0);

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="page-header">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage team roles and shop access.</p>
      </div>

      {/* Error state */}
      {isError && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="flex items-center gap-3 py-4">
            <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
            <div>
              <p className="font-medium text-destructive">Could not load team data</p>
              <p className="text-sm text-muted-foreground mt-0.5">
                Make sure the profiles table exists and you have admin access. Try refreshing the page.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pending Users */}
      {!isLoading && !isError && pendingUsers.length > 0 && (
        <Card className="border-warning/40">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <UserX className="h-5 w-5 text-warning" />
              Waiting for access ({pendingUsers.length})
            </CardTitle>
            <CardDescription>
              These people signed up but can't use the app yet. Assign a role to grant access.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {pendingUsers.map((p) => {
                const addValue = pendingAdd[p.user_id] ?? "";
                return (
                  <div
                    key={p.user_id}
                    className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 p-3 rounded-lg bg-warning/5 border border-warning/20"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{p.full_name || "No name"}</p>
                      <p className="text-xs text-muted-foreground truncate">{p.email ?? "No email"}</p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Select value={addValue} onValueChange={(v) => setPendingAdd((s) => ({ ...s, [p.user_id]: v as AppRole }))}>
                        <SelectTrigger className="h-8 w-[140px] text-sm">
                          <SelectValue placeholder="Pick role" />
                        </SelectTrigger>
                        <SelectContent>
                          {ROLE_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              <span>{opt.label}</span>
                              <span className="text-xs text-muted-foreground ml-1.5 hidden sm:inline">— {opt.description}</span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        type="button"
                        size="sm"
                        className="h-8"
                        disabled={!addValue || addRole.isPending}
                        onClick={() => {
                          const role = pendingAdd[p.user_id] as AppRole;
                          if (!role) return;
                          void addRole.mutateAsync({ userId: p.user_id, role }).then(() => {
                            setPendingAdd((s) => ({ ...s, [p.user_id]: "" }));
                          });
                        }}
                      >
                        {addRole.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : "Grant"}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Users / Roles Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" /> Team Roles
          </CardTitle>
          <CardDescription>
            Manage who can access what. Removing all roles sends a user back to the pending screen.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 text-muted-foreground py-12">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Loading team…</span>
            </div>
          ) : activeUsers.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Shield className="h-8 w-8 mx-auto mb-2 opacity-40" />
              <p className="font-medium">No active users yet</p>
              <p className="text-sm mt-1">Assign a role above to get started.</p>
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Person</TableHead>
                    <TableHead className="hidden sm:table-cell">Email</TableHead>
                    <TableHead>Roles</TableHead>
                    <TableHead className="w-[200px]">Add role</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeUsers.map((p) => {
                    const current = rolesByUser[p.user_id] ?? [];
                    const addValue = pendingAdd[p.user_id] ?? "";
                    const available = ROLE_OPTIONS.filter((opt) => !current.includes(opt.value));
                    return (
                      <TableRow key={p.user_id}>
                        <TableCell>
                          <div className="min-w-0">
                            <p className="font-medium truncate">{p.full_name || "—"}</p>
                            <p className="text-xs text-muted-foreground sm:hidden truncate">{p.email ?? ""}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground hidden sm:table-cell">{p.email ?? "—"}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {current.map((r) => (
                              <Button
                                key={r}
                                type="button"
                                variant="secondary"
                                size="sm"
                                className="h-7 text-xs gap-1"
                                disabled={removeRole.isPending}
                                onClick={() =>
                                  setConfirmRemove({
                                    userId: p.user_id,
                                    role: r,
                                    name: p.full_name || p.email || "this user",
                                  })
                                }
                              >
                                {r} ✕
                              </Button>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          {available.length > 0 ? (
                            <div className="flex gap-2">
                              <Select
                                value={addValue}
                                onValueChange={(v) => setPendingAdd((s) => ({ ...s, [p.user_id]: v as AppRole }))}
                              >
                                <SelectTrigger className="h-8 text-sm">
                                  <SelectValue placeholder="Pick role" />
                                </SelectTrigger>
                                <SelectContent>
                                  {available.map((opt) => (
                                    <SelectItem key={opt.value} value={opt.value}>
                                      {opt.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <Button
                                type="button"
                                size="sm"
                                className="h-8"
                                disabled={!addValue || addRole.isPending}
                                onClick={() => {
                                  const role = pendingAdd[p.user_id] as AppRole;
                                  if (!role) return;
                                  void addRole.mutateAsync({ userId: p.user_id, role }).then(() => {
                                    setPendingAdd((s) => ({ ...s, [p.user_id]: "" }));
                                  });
                                }}
                              >
                                Add
                              </Button>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">All roles assigned</span>
                          )}
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

      {/* Confirm remove dialog */}
      <AlertDialog open={!!confirmRemove} onOpenChange={(open) => !open && setConfirmRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove role?</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmRemove && (
                <>
                  Remove <span className="font-medium">{confirmRemove.role}</span> from{" "}
                  <span className="font-medium">{confirmRemove.name}</span>?
                  {(rolesByUser[confirmRemove.userId] ?? []).length <= 1 &&
                    " This is their only role — they'll be sent back to the access-pending screen."}
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={removeRole.isPending}
              onClick={() => {
                if (!confirmRemove) return;
                void removeRole
                  .mutateAsync({ userId: confirmRemove.userId, role: confirmRemove.role })
                  .then(() => setConfirmRemove(null));
              }}
            >
              {removeRole.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
