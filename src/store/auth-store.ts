"use client";

import { create } from "zustand";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useWishlist } from "@/store/wishlist-store";
import { useCart } from "@/store/cart-store";

export type AuthUser = {
  id: string;
  email: string;
  name: string;
};

type AuthState = {
  user: AuthUser | null;
  _hasHydrated: boolean;
  showAuthModal: boolean;
  authModalMessage: string;

  setHasHydrated: (v: boolean) => void;
  openAuthModal: (message?: string) => void;
  closeAuthModal: () => void;

  /** Hydrate user from Supabase session cookie on app mount */
  hydrateUser: () => Promise<void>;

  /**
   * Send OTP to email via Supabase Auth.
   * mode="login"  â†’ only works if the email already has an account
   * mode="signup" â†’ creates account if new, sends OTP
   */
  sendOtp: (
    email: string,
    mode: "login" | "signup"
  ) => Promise<{ error?: string; isNewUser?: boolean }>;

  /** Verify OTP returned by Supabase. For new users also saves name. */
  verifyOtp: (
    email: string,
    otp: string,
    name?: string
  ) => Promise<{ error?: string }>;

  logout: () => Promise<void>;
};

export const useAuth = create<AuthState>()((set) => ({
  user: null,
  _hasHydrated: false,
  showAuthModal: false,
  authModalMessage: "",

  setHasHydrated: (v) => set({ _hasHydrated: v }),

  openAuthModal: (message = "") =>
    set({ showAuthModal: true, authModalMessage: message }),

  closeAuthModal: () => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("kibana-auth-dismissed", "1");
    }
    set({ showAuthModal: false, authModalMessage: "" });
  },

  hydrateUser: async () => {
    try {
      const sb = createSupabaseBrowserClient();
      const { data: { session } } = await sb.auth.getSession();
      if (!session?.user) {
        set({ _hasHydrated: true });
        return;
      }
      const u = session.user;
      const name = (u.user_metadata?.name as string | undefined) || u.email!.split("@")[0];
      set({ user: { id: u.id, email: u.email!, name }, _hasHydrated: true });
      // Restore this user's wishlist and cart from their scoped localStorage
      useWishlist.getState().loadForUser(u.id);
      useCart.getState().loadForUser(u.id);
    } catch {
      set({ _hasHydrated: true });
    }
  },

  sendOtp: async (email, mode) => {
    try {
      const sb = createSupabaseBrowserClient();

      // On signup, check if the email is already registered
      if (mode === "signup") {
        try {
          const res = await fetch("/api/auth/check-email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: email.trim().toLowerCase() }),
          });
          const data = await res.json() as { exists?: boolean };
          if (data.exists) {
            return { error: "already_exists" };
          }
        } catch {
          // If check fails, allow signup to proceed
        }
      }

      const { error } = await sb.auth.signInWithOtp({
        email: email.trim().toLowerCase(),
        options: {
          // login-only: don't create a new account if email not found
          shouldCreateUser: mode === "signup",
        },
      });

      if (error) {
        // Supabase returns this when shouldCreateUser=false and email not found
        if (
          error.message.toLowerCase().includes("signups not allowed") ||
          error.message.toLowerCase().includes("not found") ||
          error.status === 422
        ) {
          return { error: "not_found" };
        }
        return { error: error.message };
      }

      return { isNewUser: mode === "signup" };
    } catch {
      return { error: "Network error. Please try again." };
    }
  },

  verifyOtp: async (email, otp, name) => {
    try {
      const sb = createSupabaseBrowserClient();

      const { data, error } = await sb.auth.verifyOtp({
        email: email.trim().toLowerCase(),
        token: otp.trim(),
        type: "email",
      });

      if (error) return { error: error.message };

      const sbUser = data.user!;

      // If a name was provided (signup), save it to Supabase user_metadata
      const displayName =
        name?.trim() ||
        (sbUser.user_metadata?.name as string | undefined) ||
        sbUser.email!.split("@")[0];

      if (name?.trim()) {
        await sb.auth.updateUser({ data: { name: name.trim() } });
      }

      const user: AuthUser = { id: sbUser.id, email: sbUser.email!, name: displayName };
      set({ user, showAuthModal: false, authModalMessage: "" });

      // Load this user's wishlist and cart from their scoped localStorage
      useWishlist.getState().loadForUser(sbUser.id);
      useCart.getState().loadForUser(sbUser.id);

      // Record login in admin users panel (fire-and-forget)
      fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
      }).catch(() => {});

      return {};
    } catch {
      return { error: "Verification failed. Please try again." };
    }
  },

  logout: async () => {
    const sb = createSupabaseBrowserClient();
    await sb.auth.signOut().catch(() => {});
    // Clear user-scoped wishlist and cart so guest sees empty state
    useWishlist.getState().clearForUser();
    useCart.getState().clearForUser();
    set({ user: null });
  },
}));


