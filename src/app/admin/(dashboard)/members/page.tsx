import { getUsers, getOrders } from "@/lib/server-data";
import { Users, Mail, Calendar, TrendingUp, Clock } from "lucide-react";

export const dynamic = "force-dynamic";

function formatINR(n: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

function timeAgo(date: string | Date) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(date).toLocaleDateString("en-IN");
}

export default async function AdminMembersPage() {
  const [users, orders] = await Promise.all([getUsers(), getOrders()]);

  // Cross-reference orders with users by email
  const userStats = users.map((u) => {
    const userOrders = orders.filter((o) => o.user?.email === u.email);
    const totalSpent = userOrders
      .filter((o) => ["processing", "shipped", "delivered"].includes(o.status))
      .reduce((s, o) => s + o.total, 0);
    return { ...u, orderCount: userOrders.length, totalSpent };
  });

  // Sort by last login
  const sorted = [...userStats].sort(
    (a, b) => new Date(b.loginAt).getTime() - new Date(a.loginAt).getTime()
  );

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const todayLogins = users.filter((u) => new Date(u.loginAt) >= todayStart).length;
  const weekLogins = users.filter((u) => new Date(u.loginAt) >= weekStart).length;
  const monthLogins = users.filter((u) => new Date(u.loginAt) >= monthStart).length;

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Members</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          All registered members (email-based login)
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          color="indigo"
          value={users.length}
          label="Total Members"
        />
        <StatCard
          icon={Clock}
          color="green"
          value={todayLogins}
          label="Logged In Today"
        />
        <StatCard
          icon={TrendingUp}
          color="blue"
          value={weekLogins}
          label="Active This Week"
        />
        <StatCard
          icon={Calendar}
          color="purple"
          value={monthLogins}
          label="This Month"
        />
      </div>

      {/* Members Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">All Members</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500">Member</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500">
                  <span className="flex items-center gap-1">
                    <Mail size={12} /> Email
                  </span>
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500">Logins</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500">Orders</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500">Total Spent</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500">Last Seen</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sorted.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center shrink-0">
                        <span className="text-sm font-semibold text-gray-600">
                          {(user.name || user.email || "?").charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{user.name || "—"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-700">
                    {user.email ?? <span className="text-gray-400">—</span>}
                  </td>
                  <td className="px-6 py-3">
                    <span className="inline-flex items-center gap-1 text-xs font-medium bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full">
                      {user.loginCount}×
                    </span>
                  </td>
                  <td className="px-6 py-3 text-gray-700">
                    {user.orderCount > 0 ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium bg-green-50 text-green-700 px-2 py-0.5 rounded-full">
                        {user.orderCount} order{user.orderCount !== 1 ? "s" : ""}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">No orders</span>
                    )}
                  </td>
                  <td className="px-6 py-3 font-medium text-gray-900">
                    {user.totalSpent > 0 ? formatINR(user.totalSpent) : "—"}
                  </td>
                  <td className="px-6 py-3 text-gray-500 text-xs">
                    {timeAgo(user.loginAt)}
                  </td>
                  <td className="px-6 py-3 text-gray-500 text-xs">
                    {user.registeredAt ? new Date(user.registeredAt).toLocaleDateString("en-IN") : "—"}
                  </td>
                </tr>
              ))}
              {sorted.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                    No members yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  color,
  value,
  label,
}: {
  icon: React.ElementType;
  color: "indigo" | "green" | "blue" | "purple";
  value: number;
  label: string;
}) {
  const colors = {
    indigo: "bg-indigo-100 text-indigo-600",
    green: "bg-green-100 text-green-600",
    blue: "bg-blue-100 text-blue-600",
    purple: "bg-purple-100 text-purple-600",
  };
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${colors[color]}`}>
        <Icon size={20} />
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500 mt-0.5">{label}</p>
    </div>
  );
}
