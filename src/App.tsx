import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { AuthBoundary } from "@/components/AuthBoundary";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { RequireRole } from "@/components/RequireRole";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import PendingAccess from "./pages/PendingAccess";
import ComingSoon from "./pages/ComingSoon";
import TimeClock from "./pages/TimeClock";
import Jobs from "./pages/Jobs";
import Performance from "./pages/Performance";
import Settings from "./pages/Settings";
import Revenue from "./pages/Revenue";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route element={<AuthBoundary />}>
              <Route path="/pending" element={<PendingAccess />} />
              <Route element={<DashboardLayout />}>
                <Route path="/" element={<Index />} />
                <Route
                  path="/technicians"
                  element={
                    <ComingSoon
                      title="Technicians"
                      description="Directory, efficiency, and revenue by tech — coming next."
                    />
                  }
                />
                <Route path="/jobs" element={<Jobs />} />
                <Route
                  path="/revenue"
                  element={
                    <RequireRole roles={["admin", "manager"]}>
                      <Revenue />
                    </RequireRole>
                  }
                />
                <Route path="/time-clock" element={<TimeClock />} />
                <Route path="/performance" element={<Performance />} />
                <Route
                  path="/bonuses"
                  element={
                    <ComingSoon
                      title="Bonuses"
                      description="Monthly pool, weighted rankings, and admin-approved payouts."
                    />
                  }
                />
                <Route
                  path="/documentation"
                  element={
                    <ComingSoon
                      title="Documentation"
                      description="Policies and reference materials for the team."
                    />
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <RequireRole roles={["admin"]}>
                      <Settings />
                    </RequireRole>
                  }
                />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
