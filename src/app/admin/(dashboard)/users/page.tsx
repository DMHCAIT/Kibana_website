import { getUsers, getOrders } from "@/lib/server-data";
import { Users } from "lucide-react";

export default async function UsersPage() {
  const users = (await getUsers()).sort(
    (a, b) => new Date(b.loginAt).getTime() - new Date(a.loginAt).getTime()
  );

  const orders = await getOrders();
  const now = new Date();

  const userStats = new Map<string, { orderCount: number; totalSpent: number }>();
  for (const order of orders) {
    if (!order.user?.phone) continue;
    const key = order.user.phone;
    const prev = userStats.get(key) ?? { orderCount: 0, totalSpent: 0 };
    userStats.set(key, { orderCount: prev.orderCount + 1, totalSpent: prev.totalSpent + order.total });
  }

  function getStatus(loginAt: string) {
    const diff = (now.getTime() - new Date(loginAt).getTime()) / 3600000;
    if (diff < 24) return { label: "Online today", cls: "bg-green-100 text-green-700" };
    if (diff < 168) return { label: "Active this week", cls: "bg-blue-100 text-blue-700" };
    return { label: "Inactive", cls: "bg-gray-100 text-gray-500" };
  }

  return (
    <div className="p-6 overflow-y-auto h-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
        <p className="text-sm text-gray-500 mt-1">
          {users.length} registered users · Login activity tracked when users sign in on the storefront.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Users", value: users.length },
          { label: "Online Today", value: users.filter(u => (now.getTime() - new Date(u.loginAt).getTime()) / 3600000 < 24).length },
          { label: "Active This Week", value: users.filter(u => (now.getTime() - new Date(u.loginAt).getTime()) / 3600000 < 168).length },
          { label: "Total Login Events", value: users.reduce((s, u) => s + (u.loginCount ?? 1), 0) },
        ].map((c) => (
          <div key={c.label} className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{c.label}</p>
            <p className="text-2xl font-bold text-gray-900">{c.value}</p>
          </div>
        ))}
      </div>

      {users.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-xl border border-dashed border-gray-200">
          <Users className="h-10 w-10 text-gray-300 mb-3" />
          <p className="text-gray-500 font-medium">No users yet</p>
          <p className="text-sm text-gray-400 mt-1 max-w-xs">
            Users will appear here automatically when they log in on the storefront.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs text-gray-500 uppercase tracking-wide">
                  <th className="px-4 py-3.5 text-left">#</th>
                  <th className="px-4 py-3.5 text-left">Name</th>
                  <th className="px-4 py-3.5 text-left">Phone</th>
                  <th className="px-4 py-3.5 text-left">Email</th>
                  <th className="px-4 py-3.5 text-left">Registered</th>
                  <th className="px-4 py-3.5 text-left">Last Login</th>
                  <th className="px-4 py-3.5 text-center">Logins</th>
                  <th className="px-4 py-3.5 text-center">Orders</th>
                  <th className="px-4 py-3.5 text-right">Total Spent</th>
                  <th className="px-4 py-3.5 text-left">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map((u, i) => {
                  const stats = userStats.get(u.phone) ?? { orderCount: 0, totalSpent: 0 };
                  const status = getStatus(u.loginAt);
                  return (
                    <tr key={u.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-4 py-3.5 text-xs text-gray-400">{i + 1}</td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-full bg-kibana-tan/30 flex items-center justify-center text-kibana-ink font-bold text-xs uppercase flex-shrink-0">
                            {(u.name || u.phone).charAt(0)}
                          </div>
                          <span className="font-medium text-gray-900 text-xs whitespace-nowrap">{u.name || "—"}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-gray-600 font-mono whitespace-nowrap">{u.phone}</td>
                      <td className="px-4 py-3.5 text-xs text-gray-500">{u.email || "—"}</td>
                      <td className="px-4 py-3.5 text-xs text-gray-500 whitespace-nowrap">
                        {u.registeredAt
                          ? new Date(u.registeredAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
                          : "—"}
                      </td>
                      <td className="px-4 py-3.5 text-xs text-gray-600 whitespace-nowrap">
                        {new Date(u.loginAt).toLocaleString("en-IN", {
                          day: "2-digit", month: "short", year: "numeric",
                          hour: "2-digit", minute: "2-digit",
                        })}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${(u.loginCount ?? 1) >= 10 ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-600"}`}>
                          {u.loginCount ?? 1}×
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-center text-xs font-medium text-gray-700">{stats.orderCount}</td>
                      <td className="px-4 py-3.5 text-right text-xs font-semibold text-gray-900 whitespace-nowrap">
                        {stats.totalSpent > 0 ? `₹${stats.totalSpent.toLocaleString("en-IN")}` : "—"}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${status.cls}`}>
                          {status.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
