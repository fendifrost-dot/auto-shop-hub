import { useState } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRoles } from "@/hooks/useUserRoles";
import {
  LayoutDashboard,
  Users,
  ClipboardCheck,
  TrendingUp,
  DollarSign,
  LineChart,
  FileText,
  Settings,
  ChevronLeft,
  Wrench,
  Clock,
  LogOut,
} from "lucide-react";

interface NavItem {
  label: string;
  icon: React.ReactNode;
  href: string;
  badge?: string;
}

const navItems: NavItem[] = [
  { label: "Dashboard", icon: <LayoutDashboard className="w-5 h-5" />, href: "/" },
  { label: "Technicians", icon: <Users className="w-5 h-5" />, href: "/technicians" },
  { label: "Job tracking", icon: <ClipboardCheck className="w-5 h-5" />, href: "/jobs" },
  { label: "Time clock", icon: <Clock className="w-5 h-5" />, href: "/time-clock" },
  { label: "Performance", icon: <TrendingUp className="w-5 h-5" />, href: "/performance" },
  { label: "Bonuses", icon: <DollarSign className="w-5 h-5" />, href: "/bonuses", badge: "New" },
  { label: "Documentation", icon: <FileText className="w-5 h-5" />, href: "/documentation" },
];

const managerNav: NavItem[] = [
  { label: "Revenue", icon: <LineChart className="w-5 h-5" />, href: "/revenue" },
];

interface SidebarProps {
  currentPath?: string;
}

export function Sidebar({ currentPath = "/" }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const { user, signOut } = useAuth();
  const { data: roles = [] } = useUserRoles();
  const isAdmin = roles.includes("admin");
  const canSeeRevenue = isAdmin || roles.includes("manager");

  return (
    <aside
      className={cn(
        "h-screen bg-sidebar flex flex-col transition-all duration-300 border-r border-sidebar-border",
        collapsed ? "w-20" : "w-64",
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-6 border-b border-sidebar-border">
        <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow shrink-0">
          <Wrench className="w-5 h-5 text-primary-foreground" />
        </div>
        {!collapsed && (
          <div className="animate-fade-in min-w-0">
            <h1 className="font-bold text-sidebar-foreground text-lg leading-tight">Boltz Automotive</h1>
            <p className="text-xs text-sidebar-muted">Success &amp; performance</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <Link
            key={item.label}
            to={item.href}
            className={cn(
              "sidebar-link group",
              currentPath === item.href && "active",
            )}
          >
            <span
              className={cn(
                "transition-colors shrink-0",
                currentPath === item.href ? "text-primary" : "text-sidebar-muted group-hover:text-sidebar-foreground",
              )}
            >
              {item.icon}
            </span>
            {!collapsed && (
              <>
                <span className="flex-1 truncate">{item.label}</span>
                {item.badge && (
                  <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-accent text-accent-foreground shrink-0">
                    {item.badge}
                  </span>
                )}
              </>
            )}
          </Link>
        ))}
        {canSeeRevenue &&
          managerNav.map((item) => (
            <Link
              key={item.label}
              to={item.href}
              className={cn("sidebar-link group", currentPath === item.href && "active")}
            >
              <span
                className={cn(
                  "transition-colors shrink-0",
                  currentPath === item.href ? "text-primary" : "text-sidebar-muted group-hover:text-sidebar-foreground",
                )}
              >
                {item.icon}
              </span>
              {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
            </Link>
          ))}
      </nav>

      {/* Settings & Collapse */}
      <div className="border-t border-sidebar-border p-3 space-y-1">
        {!collapsed && user?.email && (
          <p className="px-2 pb-2 text-xs text-sidebar-muted truncate" title={user.email}>
            {user.email}
          </p>
        )}
        {isAdmin && (
          <Link to="/settings" className={cn("sidebar-link", currentPath === "/settings" && "active")}>
            <Settings className="w-5 h-5 text-sidebar-muted shrink-0" />
            {!collapsed && <span>Settings</span>}
          </Link>
        )}
        <button
          type="button"
          onClick={() => void signOut()}
          className="sidebar-link w-full text-sidebar-muted hover:text-sidebar-foreground"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!collapsed && <span>Sign out</span>}
        </button>
        <button type="button" onClick={() => setCollapsed(!collapsed)} className="sidebar-link w-full">
          <ChevronLeft
            className={cn(
              "w-5 h-5 text-sidebar-muted transition-transform duration-300 shrink-0",
              collapsed && "rotate-180",
            )}
          />
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  );
}
