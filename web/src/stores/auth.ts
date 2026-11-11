/**
 * Lightweight auth state store.
 * In MVP this tracks session state from the HttpOnly cookie via a /auth/me call.
 */
export interface AuthUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role?: string;
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: AuthUser | null) => void;
  setLoading: (loading: boolean) => void;
}

let state: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  setUser: () => {},
  setLoading: () => {},
};

const listeners = new Set<(s: AuthState) => void>();

export function useAuth(): AuthState {
  const listener = (next: AuthState) => {
    state = next;
  };
  listeners.add(listener);
  // Return current state; components can subscribe via a custom hook in later iterations
  return state;
}

export function getAuth(): AuthState {
  return state;
}

export function setAuth(partial: Partial<AuthState>) {
  state = { ...state, ...partial };
  listeners.forEach((l) => l(state));
}

export async function fetchMe() {
  const res = await fetch("/api/v1/auth/me", { credentials: "include" });
  if (res.ok) {
    const data = (await res.json()) as { data: { user: AuthUser } };
    setAuth({ user: data.data.user, isAuthenticated: true, isLoading: false });
  } else {
    setAuth({ user: null, isAuthenticated: false, isLoading: false });
  }
}
