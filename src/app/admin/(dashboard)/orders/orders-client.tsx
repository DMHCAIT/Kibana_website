"use client";

import { useState } from "react";
import { ShoppingBag, MapPin, CreditCard, Package, ChevronDown, ChevronRight } from "lucide-react";
import type { AdminOrder } from "@/lib/server-data";

const STATUS_STYLES: Record<string, string> = {
  pending:    "bg-yellow-50 text-yellow-700 border-yellow-200",
  processing: "bg-blue-50 text-blue-700 border-blue-200",
  shipped:    "bg-indigo-50 text-indigo-700 border-indigo-200",
  delivered:  "bg-green-50 text-green-700 border-green-200",
  cancelled:  "bg-red-50 text-red-600 border-red-200",
};

const PAYMENT_STYLES: Record<string, string> = {
  paid:     "bg-green-100 text-green-700",
  pending:  "bg-yellow-100 text-yellow-700",
  refunded: "bg-gray-100 text-gray-600",
};

const ALL_STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"] as const;

function OrderRow({ order }: { order: AdminOrder }) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState(order.status);
  const [saving, setSaving] = useState(false);

  const changeStatus = async (newStatus: typeof order.status) => {
    setSaving(true);
    await fetch(`/api/admin/orders/${order.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    setStatus(newStatus);
    setSaving(false);
  };

  return (
    <>
      <tr
        className={`hover:bg-gray-50/60 transition-colors cursor-pointer ${open ? "bg-gray-50" : ""}`}
        onClick={() => setOpen(!open)}
      >
        <td className="px-4 py-4 text-xs font-mono text-gray-500">
          <div className="flex items-center gap-1.5">
            {open ? <ChevronDown className="h-3 w-3 text-gray-400" /> : <ChevronRight className="h-3 w-3 text-gray-400" />}
            #{order.id.slice(0, 8)}
          </div>
        </td>
        <td className="px-4 py-4">
          {order.user ? (
            <div>
              <p className="text-xs font-semibold text-gray-900">{order.user.name || "—"}</p>
              <p className="text-[10px] text-gray-400 font-mono">{order.user.phone}</p>
              {order.user.email && <p className="text-[10px] text-gray-400">{order.user.email}</p>}
            </div>
          ) : (
            <span className="text-xs text-gray-400">Guest</span>
          )}
        </td>
        <td className="px-4 py-4">
          <div className="flex -space-x-2">
            {order.items.slice(0, 3).map((item, i) => (
              <img
                key={i}
                src={item.image}
                alt={item.name}
                title={`${item.name} ×${item.quantity}`}
                className="h-8 w-8 rounded-lg object-cover border-2 border-white"
              />
            ))}
            {order.items.length > 3 && (
              <div className="h-8 w-8 rounded-lg bg-gray-100 border-2 border-white flex items-center justify-center text-[10px] text-gray-500 font-medium">
                +{order.items.length - 3}
              </div>
            )}
          </div>
          <p className="text-[10px] text-gray-400 mt-1">{order.items.length} item{order.items.length !== 1 ? "s" : ""}</p>
        </td>
        <td className="px-4 py-4">
          <p className="text-sm font-bold text-gray-900">₹{order.total.toLocaleString("en-IN")}</p>
          {order.paymentStatus && (
            <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-semibold ${PAYMENT_STYLES[order.paymentStatus] ?? "bg-gray-100 text-gray-500"}`}>
              {order.paymentStatus}
            </span>
          )}
        </td>
        <td className="px-4 py-4 text-xs text-gray-600 font-medium">{order.paymentMethod ?? "—"}</td>
        <td className="px-4 py-4">
          <p className="text-xs text-gray-700">
            {new Date(order.placedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
          </p>
          <p className="text-[10px] text-gray-400">
            {new Date(order.placedAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
          </p>
        </td>
        <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
          <select
            value={status}
            disabled={saving}
            onChange={(e) => changeStatus(e.target.value as typeof order.status)}
            className={`text-xs px-2.5 py-1.5 rounded-lg border font-medium transition-colors cursor-pointer focus:outline-none disabled:opacity-60 ${STATUS_STYLES[status] ?? "bg-gray-50 text-gray-600 border-gray-200"}`}
          >
            {ALL_STATUSES.map((s) => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
        </td>
      </tr>
      {open && (
        <tr>
          <td colSpan={7} className="px-4 pb-5 bg-gray-50 border-b border-gray-100">
            <div className="grid grid-cols-3 gap-4 pt-3">
              {/* Items detail */}
              <div className="col-span-2 bg-white rounded-xl border border-gray-200 p-4">
                <p className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-3">Order Items</p>
                <div className="space-y-2">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                      <img src={item.image} alt={item.name} className="h-12 w-12 rounded-lg border object-cover flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-gray-900">{item.name}</p>
                        {item.color && <p className="text-[10px] text-gray-400">Color: {item.color}</p>}
                        <p className="text-[10px] text-gray-400">Qty: {item.quantity} × ₹{item.price.toLocaleString("en-IN")}</p>
                      </div>
                      <p className="text-xs font-bold text-gray-900">₹{(item.price * item.quantity).toLocaleString("en-IN")}</p>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-100 mt-3 pt-3 flex justify-between items-center">
                  <span className="text-xs text-gray-500 font-medium">Order Total</span>
                  <span className="text-sm font-bold text-gray-900">₹{order.total.toLocaleString("en-IN")}</span>
                </div>
              </div>
              {/* Shipping + Tracking + Payment */}
              <div className="space-y-3">
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                  <div className="flex items-center gap-1.5 mb-2">
                    <MapPin className="h-3.5 w-3.5 text-gray-400" />
                    <p className="text-xs font-bold text-gray-700 uppercase tracking-wide">Shipping Address</p>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">{order.shippingAddress ?? "Not provided"}</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Package className="h-3.5 w-3.5 text-gray-400" />
                    <p className="text-xs font-bold text-gray-700 uppercase tracking-wide">Tracking</p>
                  </div>
                  {order.trackingId ? (
                    <p className="text-xs font-mono text-gray-700 bg-gray-50 px-2 py-1.5 rounded-lg">{order.trackingId}</p>
                  ) : (
                    <p className="text-xs text-gray-400">Not assigned yet</p>
                  )}
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                  <div className="flex items-center gap-1.5 mb-2">
                    <CreditCard className="h-3.5 w-3.5 text-gray-400" />
                    <p className="text-xs font-bold text-gray-700 uppercase tracking-wide">Payment</p>
                  </div>
                  <p className="text-xs text-gray-700 font-semibold">{order.paymentMethod ?? "—"}</p>
                  {order.paymentStatus && (
                    <span className={`mt-1 inline-block text-[10px] px-2 py-0.5 rounded-full font-semibold ${PAYMENT_STYLES[order.paymentStatus] ?? "bg-gray-100 text-gray-500"}`}>
                      {order.paymentStatus}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

type Props = { orders: AdminOrder[]; total: number };

export function OrdersClient({ orders, total }: Props) {
  const [filter, setFilter] = useState<string>("all");
  const filtered = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  const counts: Record<string, number> = { all: orders.length };
  orders.forEach((o) => { counts[o.status] = (counts[o.status] ?? 0) + 1; });

  return (
    <div className="p-6 overflow-y-auto h-full">
      <div className="mb-5 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-sm text-gray-500 mt-1">{orders.length} total · ₹{total.toLocaleString("en-IN")} revenue</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {["all", "pending", "processing", "shipped", "delivered", "cancelled"].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
              filter === s ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-500 border-gray-200 hover:border-gray-400"
            }`}
          >
            {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
            <span className={`ml-1.5 ${filter === s ? "text-white/70" : "text-gray-400"}`}>({counts[s] ?? 0})</span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-xl border border-dashed border-gray-200">
          <ShoppingBag className="h-10 w-10 text-gray-300 mb-3" />
          <p className="text-gray-500 font-medium">No orders</p>
          <p className="text-sm text-gray-400 mt-1">No orders match this filter</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs text-gray-500 uppercase tracking-wide">
                  <th className="px-4 py-3.5 text-left">Order ID</th>
                  <th className="px-4 py-3.5 text-left">Customer</th>
                  <th className="px-4 py-3.5 text-left">Items</th>
                  <th className="px-4 py-3.5 text-left">Total</th>
                  <th className="px-4 py-3.5 text-left">Payment</th>
                  <th className="px-4 py-3.5 text-left">Date</th>
                  <th className="px-4 py-3.5 text-left">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((o) => <OrderRow key={o.id} order={o} />)}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
