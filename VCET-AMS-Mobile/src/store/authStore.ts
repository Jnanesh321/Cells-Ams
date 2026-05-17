import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';
import type { UserRole } from '../types';

const TOKEN_KEY = 'vcet.auth.token';
const REFRESH_TOKEN_KEY = 'vcet.auth.refreshToken';
const USER_KEY = 'vcet.auth.user';

export type AuthUser = {
  id: string;
  usn: string;
  name: string;
  role: UserRole;
  departmentId: number | null;
  section: string | null;
  department?: string;
  designation?: string;
  email?: string;
  phone?: string;
  year?: number;
  semester?: number;
  gpa?: number;
  academicStatus?: string;
};

type AuthSnapshot = {
  token: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
};

type SetAuthInput = AuthSnapshot;

type AuthStoreState = AuthSnapshot & {
  isAuthenticated: boolean;
  setAuth: (auth: SetAuthInput) => Promise<void>;
  clearAuth: () => Promise<void>;
  rehydrate: () => Promise<void>;
  setToken: (token: string | null) => Promise<void>;
  setUser: (user: AuthUser | null) => Promise<void>;
  logout: () => Promise<void>;
};

async function persistAuthSnapshot(snapshot: AuthSnapshot) {
  if (snapshot.token) {
    await SecureStore.setItemAsync(TOKEN_KEY, snapshot.token);
  } else {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  }

  if (snapshot.refreshToken) {
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, snapshot.refreshToken);
  } else {
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
  }

  if (snapshot.user) {
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(snapshot.user));
  } else {
    await SecureStore.deleteItemAsync(USER_KEY);
  }
}

async function readAuthSnapshot(): Promise<AuthSnapshot> {
  const [token, refreshToken, userJson] = await Promise.all([
    SecureStore.getItemAsync(TOKEN_KEY),
    SecureStore.getItemAsync(REFRESH_TOKEN_KEY),
    SecureStore.getItemAsync(USER_KEY),
  ]);

  let user: AuthUser | null = null;
  if (userJson) {
    try {
      user = JSON.parse(userJson) as AuthUser;
    } catch {
      user = null;
    }
  }

  return {
    token,
    refreshToken,
    user,
  };
}

const emptySnapshot: AuthSnapshot = {
  token: null,
  refreshToken: null,
  user: null,
};

export const useAuthStore = create<AuthStoreState>((set, get) => ({
  ...emptySnapshot,
  isAuthenticated: false,

  setAuth: async ({ token, refreshToken, user }) => {
    const snapshot = { token, refreshToken, user };
    await persistAuthSnapshot(snapshot);
    set({
      ...snapshot,
      isAuthenticated: !!token && !!user,
    });
  },

  clearAuth: async () => {
    await persistAuthSnapshot(emptySnapshot);
    set({
      ...emptySnapshot,
      isAuthenticated: false,
    });
  },

  rehydrate: async () => {
    const snapshot = await readAuthSnapshot();
    set({
      ...snapshot,
      isAuthenticated: !!snapshot.token && !!snapshot.user,
    });
  },

  setToken: async (token: string | null) => {
    const current = get();
    const snapshot = {
      token,
      refreshToken: current.refreshToken,
      user: current.user,
    };
    await persistAuthSnapshot(snapshot);
    set({
      ...snapshot,
      isAuthenticated: !!token && !!snapshot.user,
    });
  },

  setUser: async (user: AuthUser | null) => {
    const current = get();
    const snapshot = {
      token: current.token,
      refreshToken: current.refreshToken,
      user,
    };
    await persistAuthSnapshot(snapshot);
    set({
      ...snapshot,
      isAuthenticated: !!snapshot.token && !!user,
    });
  },

  logout: async () => {
    await get().clearAuth();
  },
}));

export async function rehydrateAuth() {
  await useAuthStore.getState().rehydrate();
}

export async function clearAuth() {
  await useAuthStore.getState().clearAuth();
}

export async function setAuth(auth: SetAuthInput) {
  await useAuthStore.getState().setAuth(auth);
}
