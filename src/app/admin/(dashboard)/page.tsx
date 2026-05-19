import { getOrders, getUsers, getProducts } from "@/lib/server-data";
import {
  TrendingUp,
  Users,
  Package,
  Clock,
  Truck,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import type { ElementType } from "react";

export const dynamic = "force-dynamic";

function withTimeout<T>(p: Promise<T>, ms: number, fallback: T): Promise<T> {
  return Promise.race([p, new Promise<T>((res) => setTimeout(() => res(fallback), ms))]);
}

function formatINR(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

const STATUS_CONFIG = {
  pending: {
    label: "Pending",
    icon: Clock,
    badge: "bg-yellow-50 text-yellow-700 border-yellow-200",
  },
  processing: {
    label: "Processing",
    icon: AlertCircle,
    badge: "bg-blue-50 text-blue-700 border-blue-200",
  },
  shipped: {
    label: "Shipped",
    icon: Truck,
    badge: "bg-purple-50 text-purple-700 border-purple-200",
  },
  delivered: {
    label: "Delivered",
    icon: CheckCircle,
    badge: "bg-green-50 text-green-700 border-green-200",
  },
  cancelled: {
    label: "Cancelled",
    icon: XCircle,
    badge: "bg-red-50 text-red-700 border-red-200",
  },
} as const;

type Status = keyof typeof STATUS_CONFIG;

export default async function AdminDashboardPage() {
  const [orders, users, products] = await Promise.all([
    withTimeout(getOrders(), 2500, []),
    withTimeout(getUsers(), 2500, []),
    withTimeout(getProducts(), 2500, []),
  ]);

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Revenue (from non-cancelled, non-pending orders)
  const revenueOrders = orders.filter((o) =>
    ["processing", "shipped", "delivered"].includes(o.status)
  );
  const totalRevenue = revenueOrders.reduce((s, o) => s + o.total, 0);
  const todayRevenue = revenueOrders
    .filter((o) => new Date(o.placedAt) >= todayStart)
    .reduce((s, o) => s + o.total, 0);
  const monthRevenue = revenueOrders
    .filter((o) => new Date(o.placedAt) >= monthStart)
    .reduce((s, o) => s + o.total, 0);
  const pendingRevenue = orders
    .filter((o) => o.status === "pending")
    .reduce((s, o) => s + o.total, 0);

  // Order counts by status
  const statusCounts = orders.reduce<Record<string, number>>((acc, o) => {
    acc[o.status] = (acc[o.status] ?? 0) + 1;
    return acc;
  }, {});

  // Member stats
  const todayLogins = users.filter((u) => new Date(u.loginAt) >= todayStart).length;
  const weekLogins = users.filter((u) => new Date(u.loginAt) >= weekStart).length;

  // Recent orders
  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime())
    .slice(0, 8);

  // Monthly revenue for last 6 months
  const months: { label: string; revenue: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    const rev = revenueOrders
      .filter((o) => {
        const t = new Date(o.placedAt);
        return t >= d && t < end;
      })
      .reduce((s, o) => s + o.total, 0);
    months.push({
      label: d.toLocaleDateString("en-IN", { month: "short" }),
      revenue: rev,
    });
  }
  const maxMonthRev = Math.max(...months.map((m) => m.revenue), 1);

  return (
    <div className="p-6 space-y-6 min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {now.toLocaleDateString("en-IN", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/products/new"
            className="bg-gray-900 text-white text-sm px-4 py-2 rounded-xl hover:bg-gray-800 transition-colors font-medium"
          >
            + Add Product
          </Link>
        </div>
      </div>

      {/* Revenue Section */}
      <section>
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
          Revenue Overview
        </h2>
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard
            title="Total Revenue"
            value={formatINR(totalRevenue)}
            icon={TrendingUp}
            color="green"
            sub="All time confirmed"
          />
          <StatCard
            title="Today's Revenue"
            value={formatINR(todayRevenue)}
            icon={TrendingUp}
            color="blue"
            sub="Orders placed today"
          />
          <StatCard
            title="This Month"
            value={formatINR(monthRevenue)}
            icon={TrendingUp}
            color="purple"
            sub={new Date().toLocaleDateString("en-IN", { month: "long" })}
          />
          <StatCard
            title="Pending Revenue"
            value={formatINR(pendingRevenue)}
            icon={Clock}
            color="yellow"
            sub="Awaiting confirmation"
          />
        </div>
      </section>

      {/* Orders & Delivery */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
            Orders &amp; Delivery Status
          </h2>
          <Link href="/admin/orders" className="text-xs text-gray-500 hover:text-gray-900">
            Manage all →
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-4">
          {(
            ["pending", "processing", "shipped", "delivered", "cancelled"] as Status[]
          ).map((status) => {
            const cfg = STATUS_CONFIG[status];
            const count = statusCounts[status] ?? 0;
            return (
              <Link
                key={status}
                href={`/admin/orders?status=${status}`}
                className="bg-white rounded-2xl border border-gray-200 p-4 hover:shadow-md transition-all hover:border-gray-300"
              >
                <div className="flex items-center justify-between mb-2">
                  <cfg.icon size={16} className="text-gray-400" />
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full border ${cfg.badge}`}
                  >
                    {cfg.label}
                  </span>
                </div>
                <p className="text-3xl font-bold text-gray-900">{count}</p>
                <p className="text-xs text-gray-400 mt-0.5">orders</p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Members & Products + Monthly Chart */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Stats */}
        <div className="space-y-4">
          <StatCard
            title="Total Members"
            value={users.length.toString()}
            icon={Users}
            color="indigo"
            sub={`${todayLogins} logged in today`}
          />
          <StatCard
            title="Active This Week"
            value={weekLogins.toString()}
            icon={Users}
            color="blue"
            sub="Members with recent activity"
          />
          <StatCard
            title="Total Products"
            value={products.length.toString()}
            icon={Package}
            color="gray"
            sub={`${products.filter((p) => (p as { inStock?: boolean }).inStock !== false).length} in stock`}
          />
        </div>

        {/* Revenue Chart */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Monthly Revenue</h3>
          <div className="flex items-end gap-3 h-32">
            {months.map((m) => (
              <div key={m.label} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex flex-col justify-end" style={{ height: "100px" }}>
                  <div
                    className="w-full bg-gray-900 rounded-t-md transition-all"
                    style={{
                      height: `${Math.max(4, (m.revenue / maxMonthRev) * 100)}px`,
                    }}
                  />
                </div>
                <span className="text-xs text-gray-500">{m.label}</span>
                {m.revenue > 0 && (
                  <span className="text-xs text-gray-400">{formatINR(m.revenue)}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <section className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Recent Orders</h3>
          <Link
            href="/admin/orders"
            className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            View all →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500">Customer</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500">Phone</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500">Items</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500">Total</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500">Status</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentOrders.map((order) => {
                const status = order.status as Status;
                const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
                return (
                  <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-3">
                      <p className="font-medium text-gray-900">{order.user?.name ?? "—"}</p>
                    </td>
                    <td className="px-6 py-3 text-gray-600 font-mono text-xs">
                      {order.user?.email ?? "—"}
                    </td>
                    <td className="px-6 py-3 text-gray-600">
                      {(order.items as unknown[])?.length ?? 0} item(s)
                    </td>
                    <td className="px-6 py-3 font-semibold text-gray-900">
                      {formatINR(order.total)}
                    </td>
                    <td className="px-6 py-3">
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${cfg.badge}`}
                      >
                        <cfg.icon size={11} />
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-gray-500 text-xs">
                      {new Date(order.placedAt).toLocaleDateString("en-IN")}
                    </td>
                  </tr>
                );
              })}
              {recentOrders.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                    No orders yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function StatCard({
  title,
  value,
  sub,
  icon: Icon,
  color,
}: {
  title: string;
  value: string;
  sub?: string;
  icon: ElementType;
  color: "green" | "blue" | "purple" | "yellow" | "indigo" | "gray";
}) {
  const colors: Record<typeof color, string> = {
    green: "text-green-600 bg-green-100",
    blue: "text-blue-600 bg-blue-100",
    purple: "text-purple-600 bg-purple-100",
    yellow: "text-yellow-600 bg-yellow-100",
    indigo: "text-indigo-600 bg-indigo-100",
    gray: "text-gray-600 bg-gray-100",
  };
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${colors[color]}`}>
        <Icon size={20} />
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-600 mt-0.5">{title}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

