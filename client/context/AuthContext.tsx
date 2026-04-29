import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

export interface AuthUser {
  id: number;
  email: string;
  name: string;
  streak: number;
  created_at: string;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, name: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const TOKEN_KEY = "emotica_token";

async function apiFetch(path: string, options?: RequestInit) {
  const res = await fetch(path, options);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Request failed");
  return data;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: localStorage.getItem(TOKEN_KEY),
    isLoading: true,
  });

  // Restore session on mount
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) { setState(s => ({ ...s, isLoading: false })); return; }

    apiFetch("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } })
      .then((user: AuthUser) => setState({ user, token, isLoading: false }))
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
        setState({ user: null, token: null, isLoading: false });
      });
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const data = await apiFetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    localStorage.setItem(TOKEN_KEY, data.token);
    setState({ user: data.user, token: data.token, isLoading: false });
  }, []);

  const register = useCallback(async (email: string, name: string, password: string) => {
    const data = await apiFetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, name, password }),
    });
    localStorage.setItem(TOKEN_KEY, data.token);
    setState({ user: data.user, token: data.token, isLoading: false });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setState({ user: null, token: null, isLoading: false });
  }, []);

  const refreshUser = useCallback(async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return;
    const user = await apiFetch("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } });
    setState(s => ({ ...s, user }));
  }, []);

  return (
    <AuthContext.Provider value={{
      ...state,
      login,
      register,
      logout,
      refreshUser,
      isAuthenticated: !!state.user,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

// Convenience hook — returns a pre-configured fetch that includes the JWT
export function useApiFetch() {
  const { token } = useAuth();

  return useCallback(async <T = unknown>(path: string, options?: RequestInit): Promise<T> => {
    const res = await fetch(path, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options?.headers ?? {}),
      },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Request failed");
    return data as T;
  }, [token]);
}
