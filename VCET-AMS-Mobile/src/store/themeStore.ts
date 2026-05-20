import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ColorScheme } from '../constants/colors';

type ThemeStoreState = {
  colorScheme: ColorScheme;
  setColorScheme: (scheme: ColorScheme) => void;
  toggleColorScheme: () => void;
};

export const useThemeStore = create<ThemeStoreState>()(
  persist(
    (set, get) => ({
      colorScheme: 'light',
      setColorScheme: (scheme) => set({ colorScheme: scheme }),
      toggleColorScheme: () => set({ colorScheme: get().colorScheme === 'light' ? 'dark' : 'light' }),
    }),
    {
      name: 'vcet.theme',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
