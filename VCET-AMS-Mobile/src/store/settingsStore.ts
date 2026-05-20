import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type SystemSettings = {
  currentSemester: string;
  attendanceThreshold: number;
  iaMaxMarks: number;
  autoBackupInterval: string;
  dataRetention: string;
  sessionTimeout: string;
  emailNotifications: boolean;
  smsAlerts: boolean;
};

type SettingsStoreState = {
  settings: SystemSettings;
  isInitialized: boolean;
  initializeIfNeeded: () => void;
  updateSetting: <K extends keyof SystemSettings>(key: K, value: SystemSettings[K]) => void;
  resetSettings: () => void;
};

const DEFAULT_SETTINGS: SystemSettings = {
  currentSemester: '5 (Odd Sem 2024-25)',
  attendanceThreshold: 75,
  iaMaxMarks: 50,
  autoBackupInterval: 'Every 6 hours',
  dataRetention: '5 years',
  sessionTimeout: '60 minutes',
  emailNotifications: true,
  smsAlerts: false,
};

export const useSettingsStore = create<SettingsStoreState>()(
  persist(
    (set, get) => ({
      settings: DEFAULT_SETTINGS,
      isInitialized: false,

      initializeIfNeeded: () => {
        if (!get().isInitialized) {
          set({ settings: DEFAULT_SETTINGS, isInitialized: true });
        }
      },

      updateSetting: (key, value) => {
        set((state) => ({
          settings: { ...state.settings, [key]: value },
        }));
      },

      resetSettings: () => {
        set({ settings: DEFAULT_SETTINGS });
      },
    }),
    {
      name: 'vcet.settings',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
