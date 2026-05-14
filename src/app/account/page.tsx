"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, Phone, LogOut } from "lucide-react";
import { useAuth } from "@/store/auth-store";
import { Button } from "@/components/ui/button";

export default function AccountPage() {
  const { user, logout, openAuthModal, _hasHydrated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (_hasHydrated && !user) {
      openAuthModal("Please log in to view your account.");
    }
  }, [_hasHydrated, user, openAuthModal]);

  if (!_hasHydrated) return null;

  if (!user) {
    return (
      <section className="container py-20 flex flex-col items-center text-center">
        <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
          <User className="h-7 w-7 text-muted-foreground" />
        </span>
        <h1 className="font-display text-3xl mb-2">My Account</h1>
        <p className="text-sm text-muted-foreground mb-6">Log in to access your account.</p>
        <Button onClick={() => openAuthModal()} className="rounded-none px-8">Login / Sign Up</Button>
      </section>
    );
  }

  return (
    <section className="container max-w-lg py-16">
      <h1 className="font-display text-3xl mb-8">My Account</h1>

      <div className="border border-border p-6 flex flex-col gap-5">
        {/* Avatar */}
        <div className="flex items-center gap-4">
          <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-gray-900 text-white text-xl font-semibold">
            {user.name.charAt(0).toUpperCase()}
          </span>
          <div>
            <p className="font-semibold text-lg">{user.name}</p>
            <p className="text-xs text-muted-foreground uppercase tracking-widest">Member</p>
          </div>
        </div>

        <hr className="border-border" />

        {/* Details */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3 text-sm">
            <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
            <span>+91 {user.phone}</span>
          </div>
        </div>

        <hr className="border-border" />

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <Button
            variant="outline"
            className="rounded-none justify-start gap-2"
            onClick={() => router.push("/wishlist")}
          >
            My Wishlist
          </Button>
          <Button
            variant="outline"
            className="rounded-none justify-start gap-2"
            onClick={() => router.push("/cart")}
          >
            My Cart
          </Button>
        </div>

        <hr className="border-border" />

        <button
          onClick={() => { logout(); router.push("/"); }}
          className="flex items-center gap-2 text-sm text-red-600 hover:text-red-800 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </section>
  );
}
