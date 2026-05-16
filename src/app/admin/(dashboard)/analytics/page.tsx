import { getUsers } from "@/lib/server-data";
import { Users, TrendingUp, Activity, Clock, LogIn, Star } from "lucide-react";

function fmt(n: number) { return n.toLocaleString("en-IN"); }

function StatCard({ icon: Icon, label, value, sub, color }: {
  icon: React.ComponentType<{ className?: string }>;
  label: string; value: string; sub?: string; color: string;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
        </div>
        <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

export default async function AnalyticsPage() {
  const users = (await getUsers()).sort((a, b) => new Date(b.loginAt).getTime() - new Date(a.loginAt).getTime());

  const now = new Date();
  const dayMs = 86_400_000;
  const todayLogins = users.filter((u) => now.getTime() - new Date(u.loginAt).getTime() < dayMs).length;
  const weekLogins = users.filter((u) => now.getTime() - new Date(u.loginAt).getTime() < 7 * dayMs).length;
  const totalLogins = users.reduce((s, u) => s + (u.loginCount ?? 1), 0);
  const avgLogins = users.length ? Math.round(totalLogins / users.length) : 0;

  // New registrations this month
  const newThisMonth = users.filter((u) => {
    if (!u.registeredAt) return false;
    return now.getTime() - new Date(u.registeredAt).getTime() < 30 * dayMs;
  }).length;

  // Login frequency bucketing
  const freq = { "1": 0, "2-5": 0, "6-10": 0, "10+": 0 };
  users.forEach((u) => {
    const c = u.loginCount ?? 1;
    if (c === 1) freq["1"]++;
    else if (c <= 5) freq["2-5"]++;
    else if (c <= 10) freq["6-10"]++;
    else freq["10+"]++;
  });

  const maxFreq = Math.max(...Object.values(freq), 1);

  return (
    <div className="p-6 overflow-y-auto h-full space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Login Analytics</h1>
        <p className="text-sm text-gray-500 mt-1">User login activity and registration trends</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Users" value={fmt(users.length)} sub={`${newThisMonth} new this month`} color="bg-blue-100 text-blue-700" />
        <StatCard icon={LogIn} label="Logins Today" value={fmt(todayLogins)} sub="Active in last 24 hours" color="bg-green-100 text-green-700" />
        <StatCard icon={Activity} label="Logins This Week" value={fmt(weekLogins)} sub="Active in last 7 days" color="bg-purple-100 text-purple-700" />
        <StatCard icon={TrendingUp} label="Total Login Events" value={fmt(totalLogins)} sub={`Avg ${avgLogins} per user`} color="bg-amber-100 text-amber-700" />
      </div>

      {/* Login Frequency Distribution */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="h-4 w-4 text-gray-500" />
          <h2 className="text-sm font-bold text-gray-800">Login Frequency Distribution</h2>
          <span className="ml-auto text-xs text-gray-400">How often users return</span>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {Object.entries(freq).map(([label, count]) => (
            <div key={label} className="text-center">
              <div className="h-24 bg-gray-50 rounded-xl flex items-end justify-center p-2">
                <div
                  className="w-full bg-gray-900 rounded-lg transition-all"
                  style={{ height: `${Math.round((count / maxFreq) * 100)}%`, minHeight: count > 0 ? "8px" : "0" }}
                />
              </div>
              <p className="text-lg font-bold text-gray-900 mt-2">{count}</p>
              <p className="text-xs text-gray-500">{label} login{label !== "1" ? "s" : ""}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Monthly Logins */}
      {(() => {
        const monthMap: Record<string, number> = {};
        users.forEach((u) => {
          const d = new Date(u.loginAt);
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
          monthMap[key] = (monthMap[key] ?? 0) + 1;
        });
        const months = Object.entries(monthMap).sort(([a], [b]) => a.localeCompare(b));
        const maxM = Math.max(...months.map(([, v]) => v), 1);
        const MNAMES: Record<string, string> = { "01": "Jan", "02": "Feb", "03": "Mar", "04": "Apr", "05": "May", "06": "Jun", "07": "Jul", "08": "Aug", "09": "Sep", "10": "Oct", "11": "Nov", "12": "Dec" };
        return (
          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-4 w-4 text-gray-500" />
              <h2 className="text-sm font-bold text-gray-800">Monthly Active Users</h2>
            </div>
            {months.length === 0 ? (
              <p className="text-xs text-gray-400 py-4 text-center">No login data yet</p>
            ) : (
              <div className="space-y-2.5">
                {months.map(([key, count]) => {
                  const [year, mon] = key.split("-");
                  const pct = Math.round((count / maxM) * 100);
                  return (
                    <div key={key}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-600 font-medium">{MNAMES[mon]} {year}</span>
                        <span className="font-bold text-gray-900">{count} active users</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-2 bg-blue-500 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })()}

      {/* Recent Login Activity */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="h-4 w-4 text-gray-500" />
          <h2 className="text-sm font-bold text-gray-800">Recent Login Activity</h2>
          <span className="ml-auto text-xs text-gray-400">{users.length} registered users</span>
        </div>
        {users.length === 0 ? (
          <div className="py-10 text-center">
            <Users className="h-8 w-8 text-gray-200 mx-auto mb-2" />
            <p className="text-xs text-gray-400">No users have logged in yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-xs text-gray-500 uppercase tracking-wide">
                  <th className="pb-3 text-left">#</th>
                  <th className="pb-3 text-left">Name</th>
                  <th className="pb-3 text-left">Phone / Email</th>
                  <th className="pb-3 text-left">Registered</th>
                  <th className="pb-3 text-left">Last Login</th>
                  <th className="pb-3 text-center">Login Count</th>
                  <th className="pb-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map((u, i) => {
                  const lastLoginMs = now.getTime() - new Date(u.loginAt).getTime();
                  const isActive = lastLoginMs < 7 * dayMs;
                  const isRecent = lastLoginMs < dayMs;
                  return (
                    <tr key={u.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="py-3.5 text-xs text-gray-400">{i + 1}</td>
                      <td className="py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600 flex-shrink-0">
                            {(u.name || u.phone).charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-gray-900">{u.name || "—"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5">
                        <p className="text-xs text-gray-600 font-mono">{u.phone}</p>
                        {u.email && <p className="text-[10px] text-gray-400">{u.email}</p>}
                      </td>
                      <td className="py-3.5 text-xs text-gray-500">
                        {u.registeredAt
                          ? new Date(u.registeredAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
                          : "—"}
                      </td>
                      <td className="py-3.5 text-xs text-gray-600">
                        {new Date(u.loginAt).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </td>
                      <td className="py-3.5 text-center">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${(u.loginCount ?? 1) >= 10 ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-600"}`}>
                          {(u.loginCount ?? 1) >= 10 && <Star className="h-2.5 w-2.5" />}
                          {u.loginCount ?? 1}×
                        </span>
                      </td>
                      <td className="py-3.5 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${isRecent ? "bg-green-100 text-green-700" : isActive ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-500"}`}>
                          {isRecent ? "Online today" : isActive ? "Active this week" : "Inactive"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
