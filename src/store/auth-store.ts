"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type AuthUser = {
  id: string;
  phone: string;
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
  login: (phone: string, password: string) => Promise<{ error?: string }>;
  signup: (phone: string, password: string, name: string) => Promise<{ error?: string }>;
  logout: () => void;
};

type CredStore = Record<string, { passwordHash: string; name: string; id: string }>;

function simpleHash(str: string): string {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  }
  return h.toString(16);
}

const CRED_KEY = "kibana-creds";

function getCredStore(): CredStore {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(CRED_KEY) ?? "{}");
  } catch {
    return {};
  }
}

function saveCredStore(store: CredStore) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CRED_KEY, JSON.stringify(store));
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      _hasHydrated: false,
      showAuthModal: false,
      authModalMessage: "",

      setHasHydrated: (v: boolean) => set({ _hasHydrated: v }),

      openAuthModal: (message = "") =>
        set({ showAuthModal: true, authModalMessage: message }),

      closeAuthModal: () => {
        if (typeof window !== "undefined") {
          sessionStorage.setItem("kibana-auth-dismissed", "1");
        }
        set({ showAuthModal: false, authModalMessage: "" });
      },

      login: async (phone, password) => {
        const creds = getCredStore();
        const normalized = phone.replace(/\D/g, "");
        const entry = creds[normalized];
        if (!entry) {
          return { error: "No account found with this number. Please sign up first." };
        }
        if (entry.passwordHash !== simpleHash(password)) {
          return { error: "Incorrect password. Please try again." };
        }
        const user: AuthUser = { id: entry.id, phone: normalized, name: entry.name };
        set({ user, showAuthModal: false });
        return {};
      },

      signup: async (phone, password, name) => {
        const creds = getCredStore();
        const normalized = phone.replace(/\D/g, "");
        if (!/^\d{10}$/.test(normalized)) {
          return { error: "Please enter a valid 10-digit mobile number." };
        }
        if (creds[normalized]) {
          return { error: "An account with this number already exists. Please log in." };
        }
        if (password.length < 6) {
          return { error: "Password must be at least 6 characters." };
        }
        const id = `u_${Date.now()}`;
        creds[normalized] = { passwordHash: simpleHash(password), name: name.trim(), id };
        saveCredStore(creds);
        const user: AuthUser = { id, phone: normalized, name: name.trim() };
        set({ user, showAuthModal: false });
        return {};
      },

      logout: () => set({ user: null }),
    }),
    {
      name: "kibana-auth",
      partialize: (state) => ({ user: state.user }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
