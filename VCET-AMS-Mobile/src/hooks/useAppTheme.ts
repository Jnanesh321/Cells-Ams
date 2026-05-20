import { useMemo } from 'react';
import { useThemeStore } from '../store/themeStore';
import { lightColors, darkColors } from '../constants/colors';
import type { ThemeColors, ColorScheme } from '../constants/colors';

export function useAppTheme(): { colors: ThemeColors; colorScheme: ColorScheme; isDark: boolean; toggleTheme: () => void } {
  const colorScheme = useThemeStore((s) => s.colorScheme);
  const toggleTheme = useThemeStore((s) => s.toggleColorScheme);

  const colors = useMemo(() => (colorScheme === 'dark' ? darkColors : lightColors), [colorScheme]);

  return {
    colors,
    colorScheme,
    isDark: colorScheme === 'dark',
    toggleTheme,
  };
}
