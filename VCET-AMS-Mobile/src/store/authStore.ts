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
  wardUsn?: string;
};

type AuthSnapshot = {
  token: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
};

type SetAuthInput = AuthSnapshot | {
  usn: string;
  name?: string;
  role: UserRole;
  token: string;
  refreshToken?: string | null;
  email?: string;
  phone?: string;
  department?: string;
  designation?: string;
  wardUsn?: string;
  section?: string | null;
  semester?: number;
  year?: number;
};

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
  console.log('[SS] set start:', key);
  try {
    await SecureStore.setItemAsync(key, value);
    console.log('[SS] set OK via SecureStore:', key);
  } catch (ssErr) {
    console.log('[SS] SecureStore failed, fallback to AsyncStorage:', ssErr?.message);
    try {
      await AsyncStorage.setItem(FALLBACK_PREFIX + key, value);
      console.log('[SS] set OK via AsyncStorage fallback:', key);
    } catch (asErr) {
      console.log('[SS] AsyncStorage fallback ALSO failed:', asErr?.message);
    }
  }
}

async function secureStoreDelete(key: string): Promise<void> {
  console.log('[SS] delete start:', key);
  try {
    await SecureStore.deleteItemAsync(key);
    console.log('[SS] delete OK via SecureStore:', key);
  } catch (ssErr) {
    console.log('[SS] SecureStore delete failed, fallback to AsyncStorage:', ssErr?.message);
    try {
      await AsyncStorage.removeItem(FALLBACK_PREFIX + key);
      console.log('[SS] delete OK via AsyncStorage:', key);
    } catch (asErr) {
      console.log('[SS] AsyncStorage delete ALSO failed:', asErr?.message);
    }
  }
}

async function persistAuthSnapshot(snapshot: AuthSnapshot) {
  console.log('[PERSIST] starting with token:', !!snapshot.token, 'refreshToken:', !!snapshot.refreshToken, 'user:', !!snapshot.user);
  if (snapshot.token) {
    console.log('[PERSIST] storing token');
    await secureStoreSet(TOKEN_KEY, snapshot.token);
    console.log('[PERSIST] token stored OK');
  } else {
    await secureStoreDelete(TOKEN_KEY);
  }

  if (snapshot.refreshToken) {
    console.log('[PERSIST] storing refreshToken');
    await secureStoreSet(REFRESH_TOKEN_KEY, snapshot.refreshToken);
    console.log('[PERSIST] refreshToken stored OK');
  } else {
    await secureStoreDelete(REFRESH_TOKEN_KEY);
  }

  if (snapshot.user) {
    console.log('[PERSIST] storing user');
    await secureStoreSet(USER_KEY, JSON.stringify(snapshot.user));
    console.log('[PERSIST] user stored OK');
  } else {
    await secureStoreDelete(USER_KEY);
  }
  console.log('[PERSIST] all done');
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

  setAuth: (userData: any) => {
    console.log('[STORE] setAuth called, role:', userData.role);
    set({ user: userData, isAuthenticated: true });
    console.log('[STORE] zustand set() done');
    persistAuthSnapshot({
      token: userData.token ?? null,
      refreshToken: userData.refreshToken ?? null,
      user: userData,
    }).catch(console.log);
  },

  clearAuth: async () => {
    set({
      ...emptySnapshot,
      isAuthenticated: false,
    });
    persistAuthSnapshot(emptySnapshot).catch(() => {});
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
    set({
      ...snapshot,
      isAuthenticated: !!token && !!snapshot.user,
    });
    persistAuthSnapshot(snapshot).catch(() => {});
  },

  setUser: async (user: AuthUser | null) => {
    const current = get();
    const snapshot = {
      token: current.token,
      refreshToken: current.refreshToken,
      user,
    };
    set({
      ...snapshot,
      isAuthenticated: !!snapshot.token && !!user,
    });
    persistAuthSnapshot(snapshot).catch(() => {});
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
