import { getRevenueStats, getOrders } from "@/lib/server-data";
import { TrendingUp, ShoppingBag, Users, IndianRupee, Package, CreditCard, BarChart3 } from "lucide-react";

const STATUS_COLOR: Record<string, string> = {
  pending:    "bg-yellow-100 text-yellow-700",
  processing: "bg-blue-100 text-blue-700",
  shipped:    "bg-indigo-100 text-indigo-700",
  delivered:  "bg-green-100 text-green-700",
  cancelled:  "bg-red-100 text-red-600",
};

function fmt(n: number) {
  return "₹" + n.toLocaleString("en-IN");
}

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

export default async function RevenuePage() {
  const stats = await getRevenueStats();
  const orders = await getOrders();

  const ordersByStatus = orders.reduce<Record<string, number>>((acc, o) => {
    acc[o.status] = (acc[o.status] ?? 0) + 1;
    return acc;
  }, {});

  const maxProductRevenue = stats.revenueByProduct[0]?.revenue ?? 1;
  const maxMonthRevenue = Math.max(...stats.revenueByMonth.map((m) => m.revenue), 1);

  const MONTH_NAMES: Record<string, string> = {
    "01": "Jan", "02": "Feb", "03": "Mar", "04": "Apr", "05": "May", "06": "Jun",
    "07": "Jul", "08": "Aug", "09": "Sep", "10": "Oct", "11": "Nov", "12": "Dec",
  };

  return (
    <div className="p-6 overflow-y-auto h-full space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Revenue</h1>
        <p className="text-sm text-gray-500 mt-1">Financial overview of your Kibana store</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={IndianRupee} label="Total Revenue" value={fmt(stats.totalRevenue)} sub="From delivered orders" color="bg-green-100 text-green-700" />
        <StatCard icon={ShoppingBag} label="Total Orders" value={String(stats.totalOrders)} sub={`${ordersByStatus.delivered ?? 0} delivered`} color="bg-blue-100 text-blue-700" />
        <StatCard icon={TrendingUp} label="Avg Order Value" value={fmt(stats.avgOrderValue)} sub="Across all active orders" color="bg-purple-100 text-purple-700" />
        <StatCard icon={CreditCard} label="Pending Revenue" value={fmt(stats.pendingRevenue)} sub="Processing / pending / shipped" color="bg-amber-100 text-amber-700" />
      </div>

      {/* Order Status Breakdown */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="h-4 w-4 text-gray-500" />
          <h2 className="text-sm font-bold text-gray-800">Orders by Status</h2>
        </div>
        <div className="grid grid-cols-5 gap-3">
          {["pending", "processing", "shipped", "delivered", "cancelled"].map((s) => (
            <div key={s} className={`rounded-xl p-3 text-center ${STATUS_COLOR[s]} bg-opacity-20`}>
              <p className="text-xl font-bold">{ordersByStatus[s] ?? 0}</p>
              <p className="text-xs capitalize mt-1 font-medium">{s}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by Month */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-4 w-4 text-gray-500" />
            <h2 className="text-sm font-bold text-gray-800">Monthly Revenue</h2>
          </div>
          {stats.revenueByMonth.length === 0 ? (
            <p className="text-xs text-gray-400 py-4 text-center">No revenue data yet</p>
          ) : (
            <div className="space-y-3">
              {stats.revenueByMonth.map((m) => {
                const [year, mon] = m.month.split("-");
                const label = `${MONTH_NAMES[mon]} ${year}`;
                const pct = Math.round((m.revenue / maxMonthRevenue) * 100);
                return (
                  <div key={m.month}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-600 font-medium">{label}</span>
                      <span className="text-gray-900 font-bold">{fmt(m.revenue)} <span className="text-gray-400 font-normal">({m.orders} orders)</span></span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-2 bg-gray-900 rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Revenue by Payment Method */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard className="h-4 w-4 text-gray-500" />
            <h2 className="text-sm font-bold text-gray-800">Revenue by Payment Method</h2>
          </div>
          {Object.keys(stats.revenueByPaymentMethod).length === 0 ? (
            <p className="text-xs text-gray-400 py-4 text-center">No payment data yet</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(stats.revenueByPaymentMethod)
                .sort(([, a], [, b]) => b - a)
                .map(([method, revenue]) => {
                  const totalActive = Object.values(stats.revenueByPaymentMethod).reduce((s, v) => s + v, 0);
                  const pct = totalActive ? Math.round((revenue / totalActive) * 100) : 0;
                  return (
                    <div key={method}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-600 font-medium">{method}</span>
                        <span className="text-gray-900 font-bold">{fmt(revenue)} <span className="text-gray-400 font-normal">({pct}%)</span></span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-2 bg-indigo-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </div>

      {/* Top Products by Revenue */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Package className="h-4 w-4 text-gray-500" />
          <h2 className="text-sm font-bold text-gray-800">Top Products by Revenue</h2>
          <span className="ml-auto text-xs text-gray-400">From delivered orders only</span>
        </div>
        {stats.revenueByProduct.length === 0 ? (
          <div className="py-10 text-center">
            <Package className="h-8 w-8 text-gray-200 mx-auto mb-2" />
            <p className="text-xs text-gray-400">No product revenue data yet. Revenue appears here after orders are marked as delivered.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {stats.revenueByProduct.map((p, i) => {
              const pct = Math.round((p.revenue / maxProductRevenue) * 100);
              return (
                <div key={p.name} className="flex items-center gap-4">
                  <div className="w-6 text-center text-xs font-bold text-gray-400">#{i + 1}</div>
                  <div className="flex-1">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-700 font-medium">{p.name}</span>
                      <span className="text-gray-900 font-bold">{fmt(p.revenue)} <span className="text-gray-400 font-normal">· {p.units} units</span></span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-2 bg-green-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Top Customers */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Users className="h-4 w-4 text-gray-500" />
          <h2 className="text-sm font-bold text-gray-800">Top Customers</h2>
          <span className="ml-auto text-xs text-gray-400">By total spending</span>
        </div>
        {stats.topCustomers.length === 0 ? (
          <p className="text-xs text-gray-400 py-4 text-center">No customer data yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-xs text-gray-500 uppercase tracking-wide">
                  <th className="pb-3 text-left">#</th>
                  <th className="pb-3 text-left">Customer</th>
                  <th className="pb-3 text-left">Phone</th>
                  <th className="pb-3 text-right">Orders</th>
                  <th className="pb-3 text-right">Total Spent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {stats.topCustomers.map((c, i) => (
                  <tr key={c.phone}>
                    <td className="py-3 text-xs text-gray-400">{i + 1}</td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-500">{c.name.charAt(0)}</div>
                        <span className="text-xs font-medium text-gray-900">{c.name}</span>
                      </div>
                    </td>
                    <td className="py-3 text-xs text-gray-500 font-mono">{c.phone}</td>
                    <td className="py-3 text-xs text-center">
                      <span className="bg-gray-100 px-2 py-0.5 rounded-full font-medium">{c.orderCount}</span>
                    </td>
                    <td className="py-3 text-xs text-right font-bold text-green-700">{fmt(c.totalSpent)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
