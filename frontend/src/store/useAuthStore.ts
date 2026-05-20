import { create } from "zustand";
import { signOut } from "firebase/auth";
import { firebaseAuth } from "../lib/firebase";
import api from "../lib/api";
import type { Role, User } from "../types/library";

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<User>;
  hydrate: () => Promise<void>;
  setSession: (token: string, user: User) => void;
  logout: () => Promise<void>;
  changePassword: (password: string) => Promise<void>;
}

export function isStaffRole(role?: Role) {
  return ["Administrador", "Bibliotecario", "Admin", "Librarian"].includes(role || "");
}

function persist(token: string, refreshToken: string, user: User) {
  localStorage.setItem("library_token", token);
  localStorage.setItem("library_refresh_token", refreshToken);
  localStorage.setItem("library_user", JSON.stringify(user));
}

function clearSession() {
  localStorage.removeItem("library_token");
  localStorage.removeItem("library_refresh_token");
  localStorage.removeItem("library_user");
}

async function tryRefresh(): Promise<string | null> {
  const refreshToken = localStorage.getItem("library_refresh_token");
  if (!refreshToken) return null;
  try {
    const { data } = await api.post<{ id_token: string; refresh_token: string }>("/auth/refresh", { refreshToken });
    const newToken = data.id_token;
    const newRefresh = data.refresh_token;
    localStorage.setItem("library_token", newToken);
    localStorage.setItem("library_refresh_token", newRefresh);
    return newToken;
  } catch {
    return null;
  }
}

function readStoredUser(): User | null {
  try {
    return JSON.parse(localStorage.getItem("library_user") || "null");
  } catch {
    localStorage.removeItem("library_user");
    return null;
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  user: readStoredUser(),
  token: localStorage.getItem("library_token") || null,
  refreshToken: localStorage.getItem("library_refresh_token") || null,
  isAuthenticated: !!localStorage.getItem("library_token"),
  login: async (email, password) => {
    const { data } = await api.post<{ token: string; refreshToken: string; user: User }>("/auth/login", { email, password });
    persist(data.token, data.refreshToken, data.user);
    set({ token: data.token, refreshToken: data.refreshToken, user: data.user, isAuthenticated: true });
    return data.user;
  },
  hydrate: async () => {
    const current = firebaseAuth.currentUser;
    if (!current) {
      const newToken = await tryRefresh();
      if (!newToken) return;
      try {
        const { data: user } = await api.get<User>("/auth/me");
        const refreshToken = localStorage.getItem("library_refresh_token") || "";
        persist(newToken, refreshToken, user);
        set({ token: newToken, refreshToken, user, isAuthenticated: true });
      } catch {
        clearSession();
        set({ token: null, refreshToken: null, user: null, isAuthenticated: false });
      }
      return;
    }
    const token = await current.getIdToken();
    localStorage.setItem("library_token", token);
    const { data: user } = await api.get<User>("/auth/me");
    const refreshToken = localStorage.getItem("library_refresh_token") || "";
    persist(token, refreshToken, user);
    set({ token, refreshToken, user, isAuthenticated: true });
  },
  setSession: (token, user) => {
    const refreshToken = localStorage.getItem("library_refresh_token") || "";
    persist(token, refreshToken, user);
    set({ token, refreshToken, user, isAuthenticated: true });
  },
  logout: async () => {
    try {
      await api.post("/auth/logout");
      await signOut(firebaseAuth).catch(() => undefined);
    } finally {
      clearSession();
      set({ token: null, refreshToken: null, user: null, isAuthenticated: false });
    }
  },
  changePassword: async (password: string) => {
    await api.patch("/auth/change-password", { password });
  },
}));

export { tryRefresh };
