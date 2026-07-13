"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Package, ShoppingBag, ChevronDown,
  Clock, Truck, CheckCircle, XCircle, AlertCircle, MapPin, CreditCard, User,
} from "lucide-react";
import { useAuth } from "@/store/auth-store";
import { Button } from "@/components/ui/button";
import { formatINR } from "@/lib/utils";
import { trackMyAccount } from "@/lib/analytics";
import { TrackPageView } from "@/components/analytics/track-page-view";

type OrderItem = { productId: string; name: string; price: number; quantity: number; image: string };
type Order = {
  id: string;
  items: OrderItem[];
  total: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  shippingAddress?: string;
  paymentMethod?: string;
  paymentStatus?: string;
  placedAt: string;
};

const STATUS_CONFIG: Record<Order["status"], { label: string; icon: React.ElementType; color: string }> = {
  pending:    { label: "Pending",    icon: Clock,       color: "text-amber-700 bg-amber-50 border-amber-200" },
  processing: { label: "Processing", icon: AlertCircle, color: "text-blue-700 bg-blue-50 border-blue-200" },
  shipped:    { label: "Shipped",    icon: Truck,       color: "text-violet-700 bg-violet-50 border-violet-200" },
  delivered:  { label: "Delivered",  icon: CheckCircle, color: "text-emerald-700 bg-emerald-50 border-emerald-200" },
  cancelled:  { label: "Cancelled",  icon: XCircle,     color: "text-red-600 bg-red-50 border-red-200" },
};

export default function OrdersPage() {
  const { user, openAuthModal, _hasHydrated } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);
  const [cancelError, setCancelError] = useState<string | null>(null);

  useEffect(() => {
    if (_hasHydrated && !user) openAuthModal("Please log in to view your orders.");
  }, [_hasHydrated, user, openAuthModal]);

  useEffect(() => {
    if (user) {
      trackMyAccount(user.id);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    fetch("/api/orders")
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setOrders(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm("Are you sure you want to cancel this order?")) return;

    setCancellingOrderId(orderId);
    setCancelError(null);

    try {
      const res = await fetch("/api/orders/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });

      const data = await res.json();

      if (!res.ok) {
        setCancelError(data.error || "Failed to cancel order");
        return;
      }

      // Update the local orders state
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: "cancelled" } : o))
      );
      
      setCancellingOrderId(null);
    } catch (err) {
      setCancelError(err instanceof Error ? err.message : "Failed to cancel order");
    } finally {
      setCancellingOrderId(null);
    }
  };

  if (!_hasHydrated) return null;

  if (!user) {
    return (
      <section className="container py-20 flex flex-col items-center text-center px-4">
        <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
          <User className="h-7 w-7 text-muted-foreground" />
        </span>
        <h1 className="font-display text-3xl mb-2">My Orders</h1>
        <p className="text-sm text-muted-foreground mb-6">Log in to view your order history.</p>
        <Button onClick={() => openAuthModal()} className="rounded-none px-8">Login / Sign Up</Button>
      </section>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 pb-24 md:pb-12">
      <TrackPageView pageName="My Orders" pageType="orders" />
      <div className="container max-w-2xl py-6 px-4 sm:px-6">
        <h1 className="font-display text-2xl sm:text-3xl mb-5">My Orders</h1>

        <div className="bg-white border border-border rounded-xl overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-muted-foreground" />
              <h2 className="font-semibold text-base">Order History</h2>
            </div>
            {orders.length > 0 && (
              <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full font-medium">
                {orders.length}
              </span>
            )}
          </div>

          {loading && (
            <div className="py-12 flex flex-col items-center text-muted-foreground">
              <div className="h-6 w-6 rounded-full border-2 border-border border-t-foreground animate-spin mb-3" />
              <p className="text-sm">Loading orders...</p>
            </div>
          )}

          {!loading && orders.length === 0 && (
            <div className="py-12 flex flex-col items-center text-center px-6">
              <ShoppingBag className="h-10 w-10 text-muted-foreground mb-3" />
              <p className="text-sm font-medium mb-1">No orders yet</p>
              <p className="text-xs text-muted-foreground mb-5">Your past orders will appear here.</p>
              <Button asChild size="sm" className="rounded-none px-6">
                <Link href="/shop">Start Shopping</Link>
              </Button>
            </div>
          )}

          {!loading && orders.length > 0 && (
            <ul className="divide-y divide-border">
              {orders.map((order) => {
                const cfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending;
                const Icon = cfg.icon;
                const isExpanded = expandedOrder === order.id;
                const date = new Date(order.placedAt).toLocaleDateString("en-IN", {
                  day: "numeric", month: "short", year: "numeric",
                });
                const shortId = order.id.replace(/^ORD-/, "").slice(-10).toUpperCase();

                return (
                  <li key={order.id}>
                    <button
                      type="button"
                      className="w-full flex items-center gap-3 px-4 py-4 hover:bg-muted/30 transition-colors text-left active:bg-muted/50"
                      onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                    >
                      <div className="relative h-14 w-12 shrink-0 overflow-hidden rounded-lg bg-muted border border-border">
                        {order.items[0]?.image && (
                          <Image src={order.items[0].image} alt={order.items[0].name} fill sizes="48px" className="object-cover" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-0.5">
                          <p className="text-[11px] text-muted-foreground font-mono">#{shortId}</p>
                          <span className={"inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border " + cfg.color}>
                            <Icon className="h-3 w-3" />
                            {cfg.label}
                          </span>
                        </div>
                        <p className="text-sm font-medium truncate leading-snug">
                          {order.items.length === 1
                            ? order.items[0].name
                            : order.items[0].name + " +" + (order.items.length - 1) + " more"}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-xs font-semibold">{formatINR(order.total)}</p>
                          <span className="text-muted-foreground text-[10px]">·</span>
                          <p className="text-xs text-muted-foreground">{date}</p>
                        </div>
                      </div>
                      <ChevronDown className={"h-4 w-4 text-muted-foreground shrink-0 transition-transform duration-200 " + (isExpanded ? "rotate-180" : "")} />
                    </button>

                    {isExpanded && (
                      <div className="bg-muted/20 border-t border-border px-4 py-4 space-y-4">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground mb-2.5">Items Ordered</p>
                          <ul className="space-y-2.5">
                            {order.items.map((item, i) => (
                              <li key={i} className="flex items-center gap-3 bg-white rounded-lg p-2.5 border border-border/50">
                                <div className="relative h-12 w-10 shrink-0 overflow-hidden rounded bg-muted">
                                  {item.image && (
                                    <Image src={item.image} alt={item.name} fill sizes="40px" className="object-cover" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">{item.name}</p>
                                  <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                                </div>
                                <p className="text-sm font-semibold shrink-0">{formatINR(item.price * item.quantity)}</p>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {order.shippingAddress && (
                          <div className="flex gap-2.5">
                            <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground mb-1">Delivery Address</p>
                              <p className="text-sm text-muted-foreground leading-relaxed">{order.shippingAddress}</p>
                            </div>
                          </div>
                        )}

                        {order.paymentMethod && (
                          <div className="flex gap-2.5">
                            <CreditCard className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground mb-1">Payment</p>
                              <p className="text-sm text-muted-foreground">
                                {order.paymentMethod}
                                {order.paymentStatus && (
                                  <span className={"ml-2 text-[10px] font-semibold px-1.5 py-0.5 rounded-full " + (order.paymentStatus === "paid" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700")}>
                                    {order.paymentStatus}
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>
                        )}

                        <div className="flex justify-between items-center pt-1 border-t border-border">
                          <span className="text-sm font-semibold">Order Total</span>
                          <span className="text-base font-bold">{formatINR(order.total)}</span>
                        </div>

                        {(order.status === "pending" || order.status === "processing") && (
                          <div className="pt-2 border-t border-border">
                            {cancelError && (
                              <p className="text-xs text-red-600 mb-2">{cancelError}</p>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCancelOrder(order.id)}
                              disabled={cancellingOrderId === order.id}
                              className="w-full rounded-none text-red-600 border-red-300 hover:bg-red-50"
                            >
                              {cancellingOrderId === order.id ? "Cancelling..." : "Cancel Order"}
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
