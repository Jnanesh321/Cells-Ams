import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import type { UserRole } from '../types';

const TOKEN_KEY = 'vcet.auth.token';
const REFRESH_TOKEN_KEY = 'vcet.auth.refreshToken';
const USER_KEY = 'vcet.auth.user';
const FALLBACK_PREFIX = 'fallback:';

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

function isSecureStoreAvailable(): boolean {
  try {
    return !!SecureStore;
  } catch {
    return false;
  }
}

async function secureStoreGet(key: string): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(key);
  } catch {
    try {
      return await AsyncStorage.getItem(FALLBACK_PREFIX + key);
    } catch {
      return null;
    }
  }
}

async function secureStoreSet(key: string, value: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(key, value);
  } catch {
    try {
      await AsyncStorage.setItem(FALLBACK_PREFIX + key, value);
    } catch {
    }
  }
}

async function secureStoreDelete(key: string): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(key);
  } catch {
    try {
      await AsyncStorage.removeItem(FALLBACK_PREFIX + key);
    } catch {
    }
  }
  try {
    await AsyncStorage.removeItem(FALLBACK_PREFIX + key);
  } catch {
  }
}

async function persistAuthSnapshot(snapshot: AuthSnapshot) {
  if (snapshot.token) {
    await secureStoreSet(TOKEN_KEY, snapshot.token);
  } else {
    await secureStoreDelete(TOKEN_KEY);
  }

  if (snapshot.refreshToken) {
    await secureStoreSet(REFRESH_TOKEN_KEY, snapshot.refreshToken);
  } else {
    await secureStoreDelete(REFRESH_TOKEN_KEY);
  }

  if (snapshot.user) {
    await secureStoreSet(USER_KEY, JSON.stringify(snapshot.user));
  } else {
    await secureStoreDelete(USER_KEY);
  }
}

async function readAuthSnapshot(): Promise<AuthSnapshot> {
  const [token, refreshToken, userJson] = await Promise.all([
    secureStoreGet(TOKEN_KEY),
    secureStoreGet(REFRESH_TOKEN_KEY),
    secureStoreGet(USER_KEY),
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
