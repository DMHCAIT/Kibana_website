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
import { ResponsiveImage } from "@/components/ui/responsive-image";
import type { AdminOrder } from "@/lib/server-data";

const STATUS_OPTIONS = [
  {
    value: "pending",
    label: "Pending",
    icon: Clock,
    badge: "bg-yellow-50 text-yellow-700 border-yellow-200",
  },
  {
    value: "processing",
    label: "Processing",
    icon: AlertCircle,
    badge: "bg-blue-50 text-blue-700 border-blue-200",
  },
  {
    value: "shipped",
    label: "Shipped",
    icon: Truck,
    badge: "bg-purple-50 text-purple-700 border-purple-200",
  },
  {
    value: "delivered",
    label: "Delivered",
    icon: CheckCircle,
    badge: "bg-green-50 text-green-700 border-green-200",
  },
  {
    value: "cancelled",
    label: "Cancelled",
    icon: XCircle,
    badge: "bg-red-50 text-red-700 border-red-200",
  },
] as const;

type Status = (typeof STATUS_OPTIONS)[number]["value"];

interface Props {
  orders: AdminOrder[];
  initialStatus?: string;
}

function formatINR(n: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

export function OrdersClient({ orders: initialOrders, initialStatus }: Props) {
  const [orders, setOrders] = useState(initialOrders);
  const [activeTab, setActiveTab] = useState<Status | "all">((initialStatus as Status) ?? "all");
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

  const tabCounts = orders.reduce<Record<string, number>>(
    (acc, o) => {
      acc[o.status] = (acc[o.status] ?? 0) + 1;
      acc.all = (acc.all ?? 0) + 1;
      return acc;
    },
    { all: 0 },
  );

  async function updateStatus(orderId: string, status: Status) {
    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
      }
    } finally {
      setUpdatingId(null);
    }
  }

  function getStatusCfg(status: string) {
    return STATUS_OPTIONS.find((s) => s.value === status) ?? STATUS_OPTIONS[0];
  }

  return (
    <div className="space-y-5 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <p className="mt-0.5 text-sm text-gray-500">{orders.length} total orders</p>
      </div>

      {/* Tabs */}
      <div className="flex w-fit flex-wrap gap-1 rounded-xl bg-gray-100 p-1">
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
          className="w-full rounded-xl border border-gray-300 bg-white py-2.5 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
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
          const items = order.items as Array<{
            name: string;
            price: number;
            quantity: number;
            image?: string;
            color?: string;
          }>;

          return (
            <div
              key={order.id}
              className="overflow-hidden rounded-2xl border border-gray-200 bg-white"
            >
              {/* Row */}
              <div className="flex items-center gap-4 px-5 py-4">
                {/* Status badge */}
                <div className="shrink-0">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${cfg.badge}`}
                  >
                    <cfg.icon size={11} />
                    {cfg.label}
                  </span>
                </div>

                {/* Customer */}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-gray-900">
                    {order.user?.name ?? "Guest"}
                  </p>
                  <p className="text-xs text-gray-500">{order.user?.email ?? "—"}</p>
                </div>

                {/* Items & Total */}
                <div className="mr-4 hidden text-right sm:block">
                  <p className="font-semibold text-gray-900">{formatINR(order.total)}</p>
                  <p className="text-xs text-gray-400">{items?.length ?? 0} item(s)</p>
                </div>

                {/* Date */}
                <div className="mr-4 hidden text-right md:block">
                  <p className="text-sm text-gray-600">
                    {new Date(order.placedAt).toLocaleDateString("en-IN")}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(order.placedAt).toLocaleTimeString("en-IN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>

                {/* Status Change */}
                <div className="shrink-0">
                  <select
                    value={order.status}
                    disabled={isUpdating}
                    onChange={(e) => updateStatus(order.id, e.target.value as Status)}
                    className="cursor-pointer rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-gray-900 disabled:opacity-60"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Expand */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : order.id)}
                  className="shrink-0 rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100"
                >
                  {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
              </div>

              {/* Expanded details */}
              {isExpanded && (
                <div className="space-y-4 border-t border-gray-100 bg-gray-50/50 px-5 py-4">
                  {/* Order ID & tracking */}
                  <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
                    <div>
                      <p className="mb-0.5 text-xs font-medium uppercase tracking-wide text-gray-400">
                        Order ID
                      </p>
                      <p className="font-mono text-xs text-gray-700">{order.id}</p>
                    </div>
                    {order.trackingId && (
                      <div>
                        <p className="mb-0.5 text-xs font-medium uppercase tracking-wide text-gray-400">
                          Tracking ID
                        </p>
                        <p className="font-mono text-xs text-gray-700">{order.trackingId}</p>
                      </div>
                    )}
                    {order.paymentMethod && (
                      <div>
                        <p className="mb-0.5 text-xs font-medium uppercase tracking-wide text-gray-400">
                          Payment
                        </p>
                        <p className="text-xs capitalize text-gray-700">{order.paymentMethod}</p>
                      </div>
                    )}
                  </div>

                  {/* Delivery Address */}
                  <div className="rounded-xl border border-gray-200 bg-white px-4 py-3">
                    <p className="mb-3 text-xs font-medium uppercase tracking-wide text-gray-400">
                      Delivery Address
                    </p>
                    {order.shippingAddress ? (
                      <div className="space-y-2 text-sm">
                        <p className="text-gray-900">{order.shippingAddress}</p>
                      </div>
                    ) : (
                      <p className="text-sm italic text-gray-500">No address provided</p>
                    )}
                  </div>

                  {/* Items */}
                  <div>
                    <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-400">
                      Items Ordered
                    </p>
                    <div className="space-y-2">
                      {items?.map((item, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3"
                        >
                          {item.image ? (
                            <ResponsiveImage
                              src={item.image}
                              alt={item.name}
                              width={40}
                              height={40}
                              className="shrink-0 rounded-lg border border-gray-200"
                            />
                          ) : (
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                              <Package size={16} className="text-gray-400" />
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-gray-900">
                              {item.name}
                            </p>
                            {item.color && (
                              <p className="text-xs text-gray-500">Color: {item.color}</p>
                            )}
                          </div>
                          <div className="shrink-0 text-right">
                            <p className="text-sm font-semibold text-gray-900">
                              {formatINR(item.price * item.quantity)}
                            </p>
                            <p className="text-xs text-gray-400">
                              ×{item.quantity} @ {formatINR(item.price)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Total */}
                  <div className="flex justify-end border-t border-gray-200 pt-3">
                    <div className="text-right">
                      <p className="mb-0.5 text-xs text-gray-400">Order Total</p>
                      <p className="text-xl font-bold text-gray-900">{formatINR(order.total)}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="rounded-2xl border border-gray-200 bg-white px-6 py-16 text-center">
            <Package size={32} className="mx-auto mb-3 text-gray-300" />
            <p className="font-medium text-gray-500">No orders found</p>
            <p className="mt-1 text-sm text-gray-400">
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
      className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
        active ? "bg-white text-gray-900 shadow" : "text-gray-500 hover:text-gray-700"
      }`}
    >
      {label}
      <span
        className={`rounded-full px-1.5 py-0.5 text-xs ${active ? "bg-gray-100 text-gray-700" : "bg-gray-200 text-gray-500"}`}
      >
        {count}
      </span>
    </button>
  );
}
