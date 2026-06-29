"use client";

import { create } from "zustand";
import { useWishlist } from "@/store/wishlist-store";
import { useCart } from "@/store/cart-store";
import { useProductCache } from "@/store/product-cache";
import { trackLogin, trackSignUp } from "@/lib/analytics";

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  phone?: string;
};

type AuthState = {
  user: AuthUser | null;
  _hasHydrated: boolean;
  showAuthModal: boolean;
  authModalMessage: string;

  setHasHydrated: (v: boolean) => void;
  openAuthModal: (message?: string) => void;
  closeAuthModal: () => void;

  /** Hydrate user from cookie-based session on app mount */
  hydrateUser: () => Promise<void>;

  /**
   * Send OTP to email via SMTP.
   * mode="login"  → only works if the email already has an account
   * mode="signup" → creates account if new, sends OTP
   */
  sendOtp: (
    email: string,
    mode: "login" | "signup",
    phone?: string,
    name?: string,
  ) => Promise<{ error?: string; isNewUser?: boolean }>;

  /** Verify OTP from email. For new users also saves name and phone. */
  verifyOtp: (
    email: string,
    otp: string,
    signupData?: { name: string; phone?: string },
  ) => Promise<{ error?: string }>;

  logout: () => Promise<void>;
};

export const useAuth = create<AuthState>()((set) => ({
  user: null,
  _hasHydrated: false,
  showAuthModal: false,
  authModalMessage: "",

  setHasHydrated: (v) => set({ _hasHydrated: v }),

  openAuthModal: (message = "") => set({ showAuthModal: true, authModalMessage: message }),

  closeAuthModal: () => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("kibana-auth-dismissed", "1");
    }
    set({ showAuthModal: false, authModalMessage: "" });
  },

  hydrateUser: async () => {
    try {
      // Get user from server-side cookie auth
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const userData = await res.json();
        if (userData.id) {
          set({ user: userData, _hasHydrated: true });
          // Pre-cache products and restore user's cart/wishlist in parallel
          await Promise.all([
            useProductCache.getState().fetch(),
            useWishlist.getState().loadForUser(userData.id),
            useCart.getState().loadForUser(userData.id),
          ]);
          return;
        }
      }
    } catch {
      // Cookie auth failed, user is not logged in
    }

    set({ _hasHydrated: true });
  },

  sendOtp: async (email, mode, phone, name) => {
    try {
      const cleanEmail = email.trim().toLowerCase();

      // On signup, check if the email is already registered
      if (mode === "signup") {
        try {
          const res = await fetch("/api/auth/check-email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: cleanEmail }),
          });
          const data = (await res.json()) as { exists?: boolean };
          if (data.exists) {
            return { error: "already_exists" };
          }
        } catch {
          // If check fails, allow signup to proceed
        }
      } else if (mode === "login") {
        // For login, check if email exists
        try {
          const res = await fetch("/api/auth/check-email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: cleanEmail }),
          });
          const data = (await res.json()) as { exists?: boolean };
          if (!data.exists) {
            return { error: "not_found" };
          }
        } catch {
          // If check fails, allow login to proceed
        }
      }

      // Send OTP via SMTP
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: cleanEmail,
          type: mode,
          name: name || undefined,
        }),
      });

      const data = (await res.json()) as { error?: string };
      if (!res.ok || data.error) {
        return { error: data.error || "Failed to send verification code" };
      }

      return { isNewUser: mode === "signup" };
    } catch {
      return { error: "Network error. Please try again." };
    }
  },

  verifyOtp: async (email, otp, signupData) => {
    try {
      const cleanEmail = email.trim().toLowerCase();

      // Send OTP verification directly to server
      // Let the server handle all OTP validation
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: cleanEmail,
          otp: otp.trim(),
          signupData: signupData
            ? {
                name: signupData.name.trim(),
                ...(signupData.phone?.trim() && { phone: signupData.phone.trim() }),
              }
            : undefined,
        }),
      });

      const data = (await response.json()) as { error?: string; user?: AuthUser };
      if (!response.ok || data.error) {
        return { error: data.error || "Verification failed" };
      }

      if (data.user) {
        set({ user: data.user, showAuthModal: false, authModalMessage: "" });
        // Pre-cache products and restore user's cart/wishlist in parallel
        await Promise.all([
          useProductCache.getState().fetch(),
          useWishlist.getState().loadForUser(data.user.id),
          useCart.getState().loadForUser(data.user.id),
        ]);

        if (signupData) {
          trackSignUp(data.user.id);
        } else {
          trackLogin(data.user.id);
        }

        // Record login in admin users panel (fire-and-forget)
        fetch("/api/admin/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data.user),
        }).catch(() => {});
      }

      return {};
    } catch {
      return { error: "Verification failed. Please try again." };
    }
  },

  logout: async () => {
    // Call server logout to clear kibana-user-id cookie
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // Ignore errors
    }

    // Clear user-scoped wishlist and cart so guest sees empty state
    useWishlist.getState().clearForUser();
    useCart.getState().clearForUser();
    set({ user: null });
  },
}));
