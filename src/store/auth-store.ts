"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

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
  login: (email: string, password: string) => Promise<{ error?: string }>;
  signup: (email: string, password: string, name: string) => Promise<{ error?: string }>;
  logout: () => void;
};

// Minimal mock credential store keyed by email (stored in localStorage via persist)
type CredStore = Record<string, { passwordHash: string; name: string; id: string }>;

function simpleHash(str: string): string {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  }
  return h.toString(16);
}

// Separate store for credentials (not exposed in main state)
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

      closeAuthModal: () =>
        set({ showAuthModal: false, authModalMessage: "" }),

      login: async (email, password) => {
        const creds = getCredStore();
        const normalized = email.trim().toLowerCase();
        const entry = creds[normalized];
        if (!entry) {
          return { error: "No account found. Please sign up first." };
        }
        if (entry.passwordHash !== simpleHash(password)) {
          return { error: "Incorrect password. Please try again." };
        }
        const user: AuthUser = { id: entry.id, email: normalized, name: entry.name };
        set({ user, showAuthModal: false });
        return {};
      },

      signup: async (email, password, name) => {
        const creds = getCredStore();
        const normalized = email.trim().toLowerCase();
        if (creds[normalized]) {
          return { error: "An account with this email already exists. Please log in." };
        }
        if (password.length < 6) {
          return { error: "Password must be at least 6 characters." };
        }
        const id = `u_${Date.now()}`;
        creds[normalized] = { passwordHash: simpleHash(password), name: name.trim(), id };
        saveCredStore(creds);
        const user: AuthUser = { id, email: normalized, name: name.trim() };
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
