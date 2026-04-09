import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { FullPageSpinner } from "@/components/FullPageSpinner";
import { useUserRoles, type AppRole } from "@/hooks/useUserRoles";

type RequireRoleProps = {
  roles: AppRole[];
  children: ReactNode;
  fallbackPath?: string;
};

export function RequireRole({ roles, children, fallbackPath = "/" }: RequireRoleProps) {
  const { data: userRoles = [], isLoading } = useUserRoles();

  if (isLoading) {
    return <FullPageSpinner />;
  }

  const allowed = roles.some((r) => userRoles.includes(r));
  if (!allowed) {
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
}
