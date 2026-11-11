import { Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import { useAuth } from "./stores/auth";

const queryClient = new QueryClient();

function RequireAuth({ children }: { children?: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function RequireRole({ roles, children }: { roles: string[]; children?: React.ReactNode }) {
  const { user } = useAuth();
  if (!user) return null;
  if (!roles.includes(user.role ?? "")) return <Navigate to="/unauthorized" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/unauthorized" element={<div className="p-4">Unauthorized</div>} />
        <Route element={<RequireAuth />}>
          <Route path="/" element={<Dashboard />} />
          <Route element={<RequireRole roles={["SCHOOL_ADMIN", "PLATFORM_ADMIN"]} />}>
            <Route path="/schools" element={<div className="p-4">School Management</div>} />
          </Route>
        </Route>
      </Routes>
    </QueryClientProvider>
  );
}
