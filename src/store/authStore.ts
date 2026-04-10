import { create } from "zustand";
import { User } from "@/types/auth";
import apiClient from "@/services/api";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
  fetchMe: () => Promise<void>;
  initialize: () => void;
}

// Initial state helper
const getInitialAuth = () => {
  if (typeof window === "undefined") return { token: null, isAuthenticated: false };
  const token = localStorage.getItem("token");
  return { token, isAuthenticated: !!token };
};

const initialAuth = getInitialAuth();

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: initialAuth.token,
  isAuthenticated: initialAuth.isAuthenticated,
  isLoading: false,

  initialize: () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (token && !get().user && !get().isLoading) {
      get().fetchMe();
    }
  },

  setAuth: (user, token) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("token", token);
    }
    set({ user, token, isAuthenticated: true, isLoading: false });
  },

  clearAuth: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
    }
    set({ user: null, token: null, isAuthenticated: false, isLoading: false });
  },

  fetchMe: async () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      set({ user: null, isAuthenticated: false, isLoading: false });
      return;
    }

    set({ isLoading: true });
    try {
      const response = await apiClient.get("/users/me");
      const data = response.data;
      const user = data.result || data;
      
      if (user) {
        set({ user, token, isAuthenticated: true, isLoading: false });
      } else {
        set({ user: null, isAuthenticated: false, isLoading: false });
      }
    } catch (error) {
      console.error("Fetch me failed:", error);
      // Don't clear isAuthenticated here to prevent flicker if it's just a network error
      set({ isLoading: false });
    }
  },
}));
