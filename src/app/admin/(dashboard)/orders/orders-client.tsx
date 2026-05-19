"use client";

import { useState } from "react";
import {
  Clock,
  AlertCircle,
  Truck,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  Search,
  X,
  Package,
} from "lucide-react";
import type { AdminOrder } from "@/lib/server-data";

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending", icon: Clock, badge: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  { value: "processing", label: "Processing", icon: AlertCircle, badge: "bg-blue-50 text-blue-700 border-blue-200" },
  { value: "shipped", label: "Shipped", icon: Truck, badge: "bg-purple-50 text-purple-700 border-purple-200" },
  { value: "delivered", label: "Delivered", icon: CheckCircle, badge: "bg-green-50 text-green-700 border-green-200" },
  { value: "cancelled", label: "Cancelled", icon: XCircle, badge: "bg-red-50 text-red-700 border-red-200" },
] as const;

type Status = (typeof STATUS_OPTIONS)[number]["value"];

interface Props {
  orders: AdminOrder[];
  initialStatus?: string;
}

function formatINR(n: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
}

export function OrdersClient({ orders: initialOrders, initialStatus }: Props) {
  const [orders, setOrders] = useState(initialOrders);
  const [activeTab, setActiveTab] = useState<Status | "all">(
    (initialStatus as Status) ?? "all"
  );
  const [query, setQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const filtered = orders
    .filter((o) => activeTab === "all" || o.status === activeTab)
    .filter((o) => {
      if (!query) return true;
      const q = query.toLowerCase();
      return (
        o.id.toLowerCase().includes(q) ||
        (o.user?.name ?? "").toLowerCase().includes(q) ||
        (o.user?.email ?? "").includes(q)
      );
    });

  const tabCounts = orders.reduce<Record<string, number>>((acc, o) => {
    acc[o.status] = (acc[o.status] ?? 0) + 1;
    acc.all = (acc.all ?? 0) + 1;
    return acc;
  }, { all: 0 });

  async function updateStatus(orderId: string, status: Status) {
    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status } : o))
        );
      }
    } finally {
      setUpdatingId(null);
    }
  }

  function getStatusCfg(status: string) {
    return STATUS_OPTIONS.find((s) => s.value === status) ?? STATUS_OPTIONS[0];
  }

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <p className="text-sm text-gray-500 mt-0.5">{orders.length} total orders</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit flex-wrap">
        <TabBtn
          active={activeTab === "all"}
          onClick={() => setActiveTab("all")}
          count={tabCounts.all ?? 0}
          label="All"
        />
        {STATUS_OPTIONS.map((s) => (
          <TabBtn
            key={s.value}
            active={activeTab === s.value}
            onClick={() => setActiveTab(s.value)}
            count={tabCounts[s.value] ?? 0}
            label={s.label}
          />
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by customer name, phone or order ID..."
          className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white"
        />
        {query && (
          <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            <X size={16} />
          </button>
        )}
      </div>

      {/* Orders list */}
      <div className="space-y-3">
        {filtered.map((order) => {
          const cfg = getStatusCfg(order.status);
          const isExpanded = expandedId === order.id;
          const isUpdating = updatingId === order.id;
          const items = order.items as Array<{ name: string; price: number; quantity: number; image?: string; color?: string }>;

          return (
            <div key={order.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              {/* Row */}
              <div className="flex items-center gap-4 px-5 py-4">
                {/* Status badge */}
                <div className="shrink-0">
                  <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${cfg.badge}`}>
                    <cfg.icon size={11} />
                    {cfg.label}
                  </span>
                </div>

                {/* Customer */}
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-900 truncate">{order.user?.name ?? "Guest"}</p>
                  <p className="text-xs text-gray-500">{order.user?.email ?? "—"}</p>
                </div>

                {/* Items & Total */}
                <div className="hidden sm:block text-right mr-4">
                  <p className="font-semibold text-gray-900">{formatINR(order.total)}</p>
                  <p className="text-xs text-gray-400">{items?.length ?? 0} item(s)</p>
                </div>

                {/* Date */}
                <div className="hidden md:block text-right mr-4">
                  <p className="text-sm text-gray-600">
                    {new Date(order.placedAt).toLocaleDateString("en-IN")}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(order.placedAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>

                {/* Status Change */}
                <div className="shrink-0">
                  <select
                    value={order.status}
                    disabled={isUpdating}
                    onChange={(e) => updateStatus(order.id, e.target.value as Status)}
                    className="text-xs border border-gray-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-gray-900 bg-white disabled:opacity-60 cursor-pointer"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>

                {/* Expand */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : order.id)}
                  className="shrink-0 p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-400"
                >
                  {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
              </div>

              {/* Expanded details */}
              {isExpanded && (
                <div className="border-t border-gray-100 px-5 py-4 bg-gray-50/50 space-y-4">
                  {/* Order ID & tracking */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-0.5">Order ID</p>
                      <p className="font-mono text-gray-700 text-xs">{order.id}</p>
                    </div>
                    {order.trackingId && (
                      <div>
                        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-0.5">Tracking ID</p>
                        <p className="font-mono text-gray-700 text-xs">{order.trackingId}</p>
                      </div>
                    )}
                    {order.paymentMethod && (
                      <div>
                        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-0.5">Payment</p>
                        <p className="text-gray-700 capitalize text-xs">{order.paymentMethod}</p>
                      </div>
                    )}
                    {order.shippingAddress && (
                      <div className="col-span-2">
                        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-0.5">Shipping Address</p>
                        <p className="text-gray-700 text-xs">{order.shippingAddress}</p>
                      </div>
                    )}
                  </div>

                  {/* Items */}
                  <div>
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-2">Items Ordered</p>
                    <div className="space-y-2">
                      {items?.map((item, i) => (
                        <div key={i} className="flex items-center gap-3 bg-white rounded-xl border border-gray-200 px-4 py-3">
                          {item.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={item.image} alt={item.name} className="w-10 h-10 object-cover rounded-lg border border-gray-200 shrink-0" />
                          ) : (
                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                              <Package size={16} className="text-gray-400" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 text-sm truncate">{item.name}</p>
                            {item.color && <p className="text-xs text-gray-500">Color: {item.color}</p>}
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-sm font-semibold text-gray-900">{formatINR(item.price * item.quantity)}</p>
                            <p className="text-xs text-gray-400">×{item.quantity} @ {formatINR(item.price)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Total */}
                  <div className="flex justify-end border-t border-gray-200 pt-3">
                    <div className="text-right">
                      <p className="text-xs text-gray-400 mb-0.5">Order Total</p>
                      <p className="text-xl font-bold text-gray-900">{formatINR(order.total)}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 px-6 py-16 text-center">
            <Package size={32} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No orders found</p>
            <p className="text-gray-400 text-sm mt-1">
              {query ? `No results for "${query}"` : "Orders will appear here"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function TabBtn({
  active,
  onClick,
  count,
  label,
}: {
  active: boolean;
  onClick: () => void;
  count: number;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
        active ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-700"
      }`}
    >
      {label}
      <span className={`text-xs px-1.5 py-0.5 rounded-full ${active ? "bg-gray-100 text-gray-700" : "bg-gray-200 text-gray-500"}`}>
        {count}
      </span>
    </button>
  );
}

