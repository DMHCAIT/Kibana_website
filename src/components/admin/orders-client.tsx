"use client";

import { useState } from "react";
import {
  Package,
  Clock,
  Truck,
  CheckCircle,
  XCircle,
  AlertCircle,
  Trash2,
  Search,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import type { Order } from "@/types/order";

interface Props {
  initialOrders: Order[];
}

const STATUS_CONFIG = {
  pending: {
    label: "Pending",
    icon: Clock,
    badge: "bg-yellow-100 text-yellow-700 border-yellow-300",
    dotColor: "bg-yellow-500",
  },
  processing: {
    label: "Processing",
    icon: AlertCircle,
    badge: "bg-blue-100 text-blue-700 border-blue-300",
    dotColor: "bg-blue-500",
  },
  shipped: {
    label: "Shipped",
    icon: Truck,
    badge: "bg-purple-100 text-purple-700 border-purple-300",
    dotColor: "bg-purple-500",
  },
  delivered: {
    label: "Delivered",
    icon: CheckCircle,
    badge: "bg-green-100 text-green-700 border-green-300",
    dotColor: "bg-green-500",
  },
  cancelled: {
    label: "Cancelled",
    icon: XCircle,
    badge: "bg-red-100 text-red-700 border-red-300",
    dotColor: "bg-red-500",
  },
} as const;

type OrderStatus = keyof typeof STATUS_CONFIG;

function formatINR(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function OrdersClient({ initialOrders }: Props) {
  const [orders, setOrders] = useState(initialOrders);
  const [query, setQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [sortBy, setSortBy] = useState<"date" | "total">("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const filtered = orders
    .filter((o) => {
      if (statusFilter !== "all" && o.status !== statusFilter) return false;
      if (query.trim()) {
        const q = query.toLowerCase();
        return (
          o.id.toLowerCase().includes(q) ||
          o.user?.name?.toLowerCase().includes(q) ||
          o.user?.email?.toLowerCase().includes(q) ||
          o.user?.phone?.includes(q)
        );
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "date") {
        const aDate = new Date(a.placedAt).getTime();
        const bDate = new Date(b.placedAt).getTime();
        return sortDir === "asc" ? aDate - bDate : bDate - aDate;
      } else {
        return sortDir === "asc" ? a.total - b.total : b.total - a.total;
      }
    });

  async function updateOrderStatus(orderId: string, newStatus: OrderStatus) {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
        credentials: "include",
      });

      if (res.ok) {
        setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)));
      }
    } catch (err) {
      console.error("Failed to update order status", err);
    }
  }

  async function deleteOrder(orderId: string) {
    if (!confirm("Are you sure you want to delete this order?")) return;

    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.ok) {
        setOrders((prev) => prev.filter((o) => o.id !== orderId));
        setSelectedOrder(null);
      }
    } catch (err) {
      console.error("Failed to delete order", err);
    }
  }

  const selectedOrderData = orders.find((o) => o.id === selectedOrder);
  const totalRevenue = filtered.reduce((sum, o) => sum + o.total, 0);
  const completedOrders = filtered.filter((o) =>
    ["shipped", "delivered"].includes(o.status),
  ).length;

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-lg bg-white p-4 shadow">
          <div className="mb-1 text-xs uppercase tracking-wider text-gray-500">Total Orders</div>
          <div className="text-2xl font-bold text-gray-900">{filtered.length}</div>
        </div>
        <div className="rounded-lg bg-white p-4 shadow">
          <div className="mb-1 text-xs uppercase tracking-wider text-gray-500">Revenue</div>
          <div className="text-2xl font-bold text-green-600">{formatINR(totalRevenue)}</div>
        </div>
        <div className="rounded-lg bg-white p-4 shadow">
          <div className="mb-1 text-xs uppercase tracking-wider text-gray-500">Completed</div>
          <div className="text-2xl font-bold text-blue-600">{completedOrders}</div>
        </div>
        <div className="rounded-lg bg-white p-4 shadow">
          <div className="mb-1 text-xs uppercase tracking-wider text-gray-500">Pending</div>
          <div className="text-2xl font-bold text-yellow-600">
            {filtered.filter((o) => o.status === "pending").length}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Orders List */}
        <div className="lg:col-span-2">
          <div className="space-y-4 rounded-lg bg-white p-6 shadow">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Orders</h2>
              <div className="text-xs text-gray-500">{filtered.length} orders</div>
            </div>

            {/* Filters */}
            <div className="space-y-3 border-b border-gray-200 pb-4">
              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by ID, name, email, phone..."
                  className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setStatusFilter("all")}
                  className={`rounded-lg px-3 py-1 text-xs font-medium transition-colors ${
                    statusFilter === "all"
                      ? "bg-gray-900 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  All
                </button>
                {Object.entries(STATUS_CONFIG).map(([status, config]) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status as OrderStatus)}
                    className={`flex items-center gap-1 rounded-lg px-3 py-1 text-xs font-medium transition-colors ${
                      statusFilter === status
                        ? config.badge + " ring-2 ring-gray-900"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <div className={`h-2 w-2 rounded-full ${config.dotColor}`} />
                    {config.label}
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setSortBy("date");
                    if (sortDir === "asc") {
                      setSortDir("desc");
                    } else {
                      setSortDir("asc");
                    }
                  }}
                  className="flex items-center gap-1 rounded-lg bg-gray-100 px-3 py-1 text-xs text-gray-700 transition-colors hover:bg-gray-200"
                >
                  Date{" "}
                  {sortBy === "date" &&
                    (sortDir === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                </button>
                <button
                  onClick={() => {
                    setSortBy("total");
                    if (sortDir === "asc") {
                      setSortDir("desc");
                    } else {
                      setSortDir("asc");
                    }
                  }}
                  className="flex items-center gap-1 rounded-lg bg-gray-100 px-3 py-1 text-xs text-gray-700 transition-colors hover:bg-gray-200"
                >
                  Amount{" "}
                  {sortBy === "total" &&
                    (sortDir === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                </button>
              </div>
            </div>

            {/* Orders List */}
            <div className="max-h-96 space-y-2 overflow-y-auto">
              {filtered.length === 0 ? (
                <div className="py-8 text-center text-gray-500">
                  <Package size={32} className="mx-auto mb-2 opacity-50" />
                  <p>No orders found</p>
                </div>
              ) : (
                filtered.map((order) => {
                  const statusConfig = STATUS_CONFIG[order.status];
                  const StatusIcon = statusConfig.icon;

                  return (
                    <button
                      key={order.id}
                      onClick={() => setSelectedOrder(selectedOrder === order.id ? null : order.id)}
                      className={`w-full rounded-lg border-2 p-4 text-left transition-all ${
                        selectedOrder === order.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      }`}
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-semibold text-gray-900">
                            Order #{order.id.slice(0, 8)}
                          </h3>
                          <p className="text-xs text-gray-500">{formatDate(order.placedAt)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div
                            className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${statusConfig.badge}`}
                          >
                            <StatusIcon size={12} />
                            {statusConfig.label}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <div>
                          <p className="font-medium text-gray-700">{order.user?.name || "Guest"}</p>
                          <p className="text-xs text-gray-500">
                            {order.items.length} item
                            {order.items.length > 1 ? "s" : ""}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">{formatINR(order.total)}</p>
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Order Details */}
        {selectedOrderData && (
          <div className="sticky top-6 h-fit space-y-4 rounded-lg bg-white p-6 shadow">
            <h3 className="text-lg font-semibold text-gray-900">Order Details</h3>

            {/* Order ID */}
            <div>
              <label className="text-xs uppercase tracking-wider text-gray-500">Order ID</label>
              <p className="break-all font-mono text-sm text-gray-900">{selectedOrderData.id}</p>
            </div>

            {/* Customer */}
            {selectedOrderData.user && (
              <div>
                <label className="text-xs uppercase tracking-wider text-gray-500">Customer</label>
                <div className="mt-1 space-y-1">
                  <p className="font-medium text-gray-900">{selectedOrderData.user.name}</p>
                  {selectedOrderData.user.email && (
                    <p className="text-sm text-gray-600">{selectedOrderData.user.email}</p>
                  )}
                  {selectedOrderData.user.phone && (
                    <p className="text-sm text-gray-600">{selectedOrderData.user.phone}</p>
                  )}
                </div>
              </div>
            )}

            {/* Items */}
            <div>
              <label className="mb-2 block text-xs uppercase tracking-wider text-gray-500">
                Items
              </label>
              <div className="space-y-2">
                {selectedOrderData.items.map((item, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <span className="font-medium text-gray-900">{item.quantity}x</span>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{item.name}</p>
                      {item.color && <p className="text-xs text-gray-500">{item.color}</p>}
                      <p className="text-xs text-gray-600">{formatINR(item.price)} each</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Status & Actions */}
            <div className="space-y-3 border-t border-gray-200 pt-4">
              <div>
                <label className="mb-2 block text-xs uppercase tracking-wider text-gray-500">
                  Status
                </label>
                <select
                  value={selectedOrderData.status}
                  onChange={(e) =>
                    updateOrderStatus(selectedOrderData.id, e.target.value as OrderStatus)
                  }
                  className={`w-full rounded-lg border-2 px-3 py-2 text-sm font-medium transition-colors ${
                    STATUS_CONFIG[selectedOrderData.status].badge
                  }`}
                >
                  {Object.entries(STATUS_CONFIG).map(([status, config]) => (
                    <option key={status} value={status}>
                      {config.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Totals */}
              <div className="space-y-1 border-t border-gray-200 pt-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-900">{formatINR(selectedOrderData.total)}</span>
                </div>
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>{formatINR(selectedOrderData.total)}</span>
                </div>
              </div>

              {/* Delete */}
              <button
                onClick={() => deleteOrder(selectedOrderData.id)}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-100 px-3 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-200"
              >
                <Trash2 size={16} />
                Delete Order
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
