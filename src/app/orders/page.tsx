"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Package,
  ShoppingBag,
  ChevronDown,
  Clock,
  Truck,
  CheckCircle,
  XCircle,
  AlertCircle,
  MapPin,
  CreditCard,
  User,
} from "lucide-react";
import { useAuth } from "@/store/auth-store";
import { useProductCache } from "@/store/product-cache";
import { Button } from "@/components/ui/button";
import { formatINR } from "@/lib/utils";
import { getShopDisplayImage } from "@/lib/product-images";
import { trackMyAccount } from "@/lib/analytics";
import { TrackPageView } from "@/components/analytics/track-page-view";
import type { Product } from "@/types/product";

type OrderItem = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  color?: string;
  colorSlug?: string;
};
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

const STATUS_CONFIG: Record<
  Order["status"],
  { label: string; icon: React.ElementType; color: string }
> = {
  pending: { label: "Pending", icon: Clock, color: "text-amber-700 bg-amber-50 border-amber-200" },
  processing: {
    label: "Processing",
    icon: AlertCircle,
    color: "text-blue-700 bg-blue-50 border-blue-200",
  },
  shipped: {
    label: "Shipped",
    icon: Truck,
    color: "text-violet-700 bg-violet-50 border-violet-200",
  },
  delivered: {
    label: "Delivered",
    icon: CheckCircle,
    color: "text-emerald-700 bg-emerald-50 border-emerald-200",
  },
  cancelled: { label: "Cancelled", icon: XCircle, color: "text-red-600 bg-red-50 border-red-200" },
};

export default function OrdersPage() {
  const { user, openAuthModal, _hasHydrated } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
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

    // Fetch products first
    const fetchProducts = useProductCache.getState().fetch();

    // Fetch orders
    Promise.all([fetchProducts, fetch("/api/orders").then((r) => r.json())])
      .then(([prods, orderData]) => {
        setProducts(prods || []);
        if (Array.isArray(orderData)) setOrders(orderData);
      })
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
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: "cancelled" } : o)));

      setCancellingOrderId(null);
    } catch (err) {
      setCancelError(err instanceof Error ? err.message : "Failed to cancel order");
    } finally {
      setCancellingOrderId(null);
    }
  };

  // Helper function to get the correct display image for an order item
  const getOrderItemImage = (item: OrderItem): string => {
    if (item.productId) {
      const product = products.find((p) => p.id === item.productId);
      if (product && product.colorVariants && product.colorVariants.length > 0) {
        // Try colorSlug first (NEW: more reliable)
        if (item.colorSlug) {
          const variant = product.colorVariants.find((v) => v.slug === item.colorSlug);
          if (variant) {
            return getShopDisplayImage(product, variant);
          }
        }
        // Fall back to color name matching (LEGACY)
        if (item.color) {
          const variant = product.colorVariants.find((v) => v.color === item.color);
          if (variant) {
            return getShopDisplayImage(product, variant);
          }
        }
      }
    }
    // Fallback to the image stored in the order
    return item.image;
  };

  if (!_hasHydrated) return null;

  if (!user) {
    return (
      <section className="container flex flex-col items-center px-4 py-20 text-center">
        <span className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <User className="h-7 w-7 text-muted-foreground" />
        </span>
        <h1 className="mb-2 font-display text-3xl">My Orders</h1>
        <p className="mb-6 text-sm text-muted-foreground">Log in to view your order history.</p>
        <Button onClick={() => openAuthModal()} className="rounded-none px-8">
          Login / Sign Up
        </Button>
      </section>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 pb-24 md:pb-12">
      <TrackPageView pageName="My Orders" pageType="orders" />
      <div className="container max-w-2xl px-4 py-6 sm:px-6">
        <h1 className="mb-5 font-display text-2xl sm:text-3xl">My Orders</h1>

        <div className="overflow-hidden rounded-xl border border-border bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-base font-semibold">Order History</h2>
            </div>
            {orders.length > 0 && (
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                {orders.length}
              </span>
            )}
          </div>

          {loading && (
            <div className="flex flex-col items-center py-12 text-muted-foreground">
              <div className="mb-3 h-6 w-6 animate-spin rounded-full border-2 border-border border-t-foreground" />
              <p className="text-sm">Loading orders...</p>
            </div>
          )}

          {!loading && orders.length === 0 && (
            <div className="flex flex-col items-center px-6 py-12 text-center">
              <ShoppingBag className="mb-3 h-10 w-10 text-muted-foreground" />
              <p className="mb-1 text-sm font-medium">No orders yet</p>
              <p className="mb-5 text-xs text-muted-foreground">
                Your past orders will appear here.
              </p>
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
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                });
                const shortId = order.id.replace(/^ORD-/, "").slice(-10).toUpperCase();

                return (
                  <li key={order.id}>
                    <button
                      type="button"
                      className="flex w-full items-center gap-3 px-4 py-4 text-left transition-colors hover:bg-muted/30 active:bg-muted/50"
                      onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                    >
                      <div className="relative h-14 w-12 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
                        {order.items[0] && (
                          <Image
                            src={getOrderItemImage(order.items[0])}
                            alt={order.items[0].name}
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="mb-0.5 flex items-center justify-between gap-2">
                          <p className="font-mono text-[11px] text-muted-foreground">#{shortId}</p>
                          <span
                            className={
                              "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold " +
                              cfg.color
                            }
                          >
                            <Icon className="h-3 w-3" />
                            {cfg.label}
                          </span>
                        </div>
                        <p className="truncate text-sm font-medium leading-snug">
                          {order.items.length === 1
                            ? order.items[0].name
                            : order.items[0].name + " +" + (order.items.length - 1) + " more"}
                        </p>
                        <div className="mt-1 flex items-center gap-2">
                          <p className="text-xs font-semibold">{formatINR(order.total)}</p>
                          <span className="text-[10px] text-muted-foreground">·</span>
                          <p className="text-xs text-muted-foreground">{date}</p>
                        </div>
                      </div>
                      <ChevronDown
                        className={
                          "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 " +
                          (isExpanded ? "rotate-180" : "")
                        }
                      />
                    </button>

                    {isExpanded && (
                      <div className="space-y-4 border-t border-border bg-muted/20 px-4 py-4">
                        <div>
                          <p className="mb-2.5 text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
                            Items Ordered
                          </p>
                          <ul className="space-y-2.5">
                            {order.items.map((item, i) => (
                              <li
                                key={i}
                                className="flex items-center gap-3 rounded-lg border border-border/50 bg-white p-2.5"
                              >
                                <div className="relative h-12 w-10 shrink-0 overflow-hidden rounded bg-muted">
                                  {
                                    <Image
                                      src={getOrderItemImage(item)}
                                      alt={item.name}
                                      fill
                                      sizes="40px"
                                      className="object-cover"
                                    />
                                  }
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="truncate text-sm font-medium">{item.name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    Qty: {item.quantity}
                                  </p>
                                </div>
                                <p className="shrink-0 text-sm font-semibold">
                                  {formatINR(item.price * item.quantity)}
                                </p>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {order.shippingAddress && (
                          <div className="flex gap-2.5">
                            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                            <div>
                              <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
                                Delivery Address
                              </p>
                              <p className="text-sm leading-relaxed text-muted-foreground">
                                {order.shippingAddress}
                              </p>
                            </div>
                          </div>
                        )}

                        {order.paymentMethod && (
                          <div className="flex gap-2.5">
                            <CreditCard className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                            <div>
                              <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
                                Payment
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {order.paymentMethod}
                                {order.paymentStatus && (
                                  <span
                                    className={
                                      "ml-2 rounded-full px-1.5 py-0.5 text-[10px] font-semibold " +
                                      (order.paymentStatus === "paid"
                                        ? "bg-emerald-100 text-emerald-700"
                                        : "bg-amber-100 text-amber-700")
                                    }
                                  >
                                    {order.paymentStatus}
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between border-t border-border pt-1">
                          <span className="text-sm font-semibold">Order Total</span>
                          <span className="text-base font-bold">{formatINR(order.total)}</span>
                        </div>

                        {(order.status === "pending" || order.status === "processing") && (
                          <div className="border-t border-border pt-2">
                            {cancelError && (
                              <p className="mb-2 text-xs text-red-600">{cancelError}</p>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCancelOrder(order.id)}
                              disabled={cancellingOrderId === order.id}
                              className="w-full rounded-none border-red-300 text-red-600 hover:bg-red-50"
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
