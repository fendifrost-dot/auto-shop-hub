import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRoles } from "@/hooks/useUserRoles";
import { FullPageSpinner } from "@/components/FullPageSpinner";

export function AuthBoundary() {
  const { session, loading } = useAuth();
  const { data: roles, isLoading: rolesLoading } = useUserRoles();
  const location = useLocation();

  if (loading || (session && rolesLoading)) {
    return <FullPageSpinner />;
  }

  if (!session) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  const hasRole = (roles?.length ?? 0) > 0;

  if (!hasRole && location.pathname !== "/pending") {
    return <Navigate to="/pending" replace />;
  }

  if (hasRole && location.pathname === "/pending") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
