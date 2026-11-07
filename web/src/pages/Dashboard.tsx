import { useAuth } from "../stores/auth";

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <p className="text-gray-600">
        Welcome back, {user?.firstName ?? "User"} ({user?.role ?? "role"})
      </p>
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded border">Students: <span className="font-mono">0</span></div>
        <div className="p-4 bg-white rounded border">Classes: <span className="font-mono">0</span></div>
        <div className="p-4 bg-white rounded border">Attendance today: <span className="font-mono">0%</span></div>
      </div>
    </div>
  );
}
