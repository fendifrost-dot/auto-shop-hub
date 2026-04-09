import { ReactNode } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";

interface DashboardLayoutProps {
  children?: ReactNode;
  currentPath?: string;
}

export function DashboardLayout({ children, currentPath }: DashboardLayoutProps) {
  const location = useLocation();
  const path = currentPath ?? location.pathname;

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar currentPath={path} />
      <main className="flex-1 overflow-auto">
        <div className="p-4 sm:p-8 pb-24 sm:pb-8">{children ?? <Outlet />}</div>
      </main>
    </div>
  );
}
