"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User, Mail, LogOut, ShoppingBag, Heart, Package } from "lucide-react";
import { useAuth } from "@/store/auth-store";
import { useCart } from "@/store/cart-store";
import { useWishlist } from "@/store/wishlist-store";
import { Button } from "@/components/ui/button";

interface Order {
  id: string;
  items: { productId: string; name: string; price: number; quantity: number; image: string; color?: string }[];
  total: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  placedAt: string;
}

export default function AccountPage() {
  const { user, logout, openAuthModal, _hasHydrated } = useAuth();
  const { count: getCartCount } = useCart();
  const { items: wishlistItems } = useWishlist();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (_hasHydrated && !user) openAuthModal("Please log in to view your account.");
  }, [_hasHydrated, user, openAuthModal]);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    fetch("/api/orders")
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setOrders(data as Order[]); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  if (!_hasHydrated) return null;

  if (!user) {
    return (
      <section className="container py-20 flex flex-col items-center text-center px-4">
        <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
          <User className="h-7 w-7 text-muted-foreground" />
        </span>
        <h1 className="font-display text-3xl mb-2">My Account</h1>
        <p className="text-sm text-muted-foreground mb-6">Log in to access your account.</p>
        <Button onClick={() => openAuthModal()} className="rounded-none px-8">Login / Sign Up</Button>
      </section>
    );
  }

  const cartCount = getCartCount();
  const wishlistCount = wishlistItems.length;
  const orderCount = orders.length;

  return (
    <div className="min-h-screen bg-muted/30 pb-24 md:pb-12">
      <div className="container max-w-4xl py-6 px-4 sm:px-6">
        <h1 className="font-display text-2xl sm:text-3xl mb-5">My Account</h1>

        {/* User Profile Card */}
        <div className="bg-white border border-border rounded-xl overflow-hidden shadow-sm mb-6">
          <div className="bg-gray-900 px-5 py-5 flex items-center gap-4">
            <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-white/10 text-white text-2xl font-bold shrink-0 border-2 border-white/30">
              {user.name.charAt(0).toUpperCase()}
            </span>
            <div className="min-w-0">
              <p className="font-semibold text-white text-lg truncate">{user.name}</p>
              <p className="text-xs text-white/60 uppercase tracking-widest">Member</p>
            </div>
          </div>
          <div className="flex items-center gap-3 px-5 py-3.5 border-b border-border text-sm">
            <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="truncate text-muted-foreground">{user.email}</span>
          </div>
          <div className="grid grid-cols-3 divide-x divide-border border-b border-border">
            <button onClick={() => router.push("/wishlist")} className="flex flex-col items-center gap-1.5 py-4 hover:bg-muted/50 transition-colors text-sm font-medium">
              <div className="flex flex-col items-center">
                <Heart className="h-5 w-5 text-red-400 mb-1" />
                <span className="text-xs">{wishlistCount}</span>
              </div>
              <span className="text-xs">Wishlist</span>
            </button>
            <button onClick={() => router.push("/cart")} className="flex flex-col items-center gap-1.5 py-4 hover:bg-muted/50 transition-colors text-sm font-medium">
              <div className="flex flex-col items-center">
                <ShoppingBag className="h-5 w-5 text-foreground/70 mb-1" />
                <span className="text-xs">{cartCount}</span>
              </div>
              <span className="text-xs">My Cart</span>
            </button>
            <button onClick={() => router.push("/orders")} className="flex flex-col items-center gap-1.5 py-4 hover:bg-muted/50 transition-colors text-sm font-medium">
              <div className="flex flex-col items-center">
                <Package className="h-5 w-5 text-foreground/70 mb-1" />
                <span className="text-xs">{orderCount}</span>
              </div>
              <span className="text-xs">My Orders</span>
            </button>
          </div>
          <button onClick={() => { logout(); router.push("/"); }} className="w-full flex items-center gap-2.5 px-5 py-3.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white border border-border rounded-lg p-4 text-center">
            <p className="text-3xl font-bold text-emerald-700">{cartCount}</p>
            <p className="text-sm text-muted-foreground mt-1">Items in Cart</p>
          </div>
          <div className="bg-white border border-border rounded-lg p-4 text-center">
            <p className="text-3xl font-bold text-red-500">{wishlistCount}</p>
            <p className="text-sm text-muted-foreground mt-1">Wishlist Items</p>
          </div>
          <div className="bg-white border border-border rounded-lg p-4 text-center">
            <p className="text-3xl font-bold text-blue-600">{orderCount}</p>
            <p className="text-sm text-muted-foreground mt-1">Total Orders</p>
          </div>
        </div>

        {/* Recent Orders Section */}
        {orderCount > 0 && (
          <div className="bg-white border border-border rounded-xl overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b border-border">
              <h2 className="font-semibold text-lg flex items-center gap-2">
                <Package className="h-5 w-5" />
                Recent Orders
              </h2>
            </div>
            <div className="divide-y divide-border">
              {orders.slice(0, 3).map((order) => (
                <div key={order.id} className="px-5 py-4 hover:bg-muted/30 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Order #{order.id.slice(0, 8)}</span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      order.status === "delivered" ? "bg-emerald-100 text-emerald-800" :
                      order.status === "shipped" ? "bg-blue-100 text-blue-800" :
                      order.status === "processing" ? "bg-yellow-100 text-yellow-800" :
                      "bg-gray-100 text-gray-800"
                    }`}>
                      {order.status}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {order.items?.length || 0} item(s) • ₹{order.total}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(order.placedAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
            {orderCount > 3 && (
              <div className="px-5 py-3 bg-muted/50 text-center">
                <Button variant="ghost" size="sm" onClick={() => router.push("/orders")}>
                  View All Orders ({orderCount})
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {orderCount === 0 && !loading && (
          <div className="bg-white border border-border rounded-xl p-8 text-center">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-muted-foreground mb-4">No orders yet</p>
            <Button onClick={() => router.push("/shop")} className="rounded-none">
              Start Shopping
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
