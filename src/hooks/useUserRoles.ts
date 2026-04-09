import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { Database } from "@/integrations/supabase/types";

export type AppRole = Database["public"]["Enums"]["app_role"];

export function useUserRoles() {
  const { user, loading: authLoading } = useAuth();

  return useQuery({
    queryKey: ["user_roles", user?.id],
    enabled: !authLoading && !!user?.id,
    queryFn: async () => {
      if (!user?.id) return [] as AppRole[];

      const { data, error } = await supabase.from("user_roles").select("role").eq("user_id", user.id);

      if (error) throw error;
      return (data ?? []).map((r) => r.role as AppRole);
    },
  });
}

export function useHasRole(role: AppRole) {
  const { data: roles = [], isLoading } = useUserRoles();
  return { hasRole: roles.includes(role), isLoading };
}

