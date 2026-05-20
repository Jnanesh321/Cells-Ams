import React from 'react';
import { Text, View } from 'react-native';
import { useAppTheme } from '../hooks/useAppTheme';

type EmptyStateProps = {
  icon?: string;
  title: string;
  subtitle?: string;
};

export default function EmptyState({ icon = '📭', title, subtitle }: EmptyStateProps) {
  const { colors } = useAppTheme();

  return (
    <View className="flex-1 justify-center items-center px-8 py-16">
      <Text className="text-4xl mb-4">{icon}</Text>
      <Text className="text-lg font-semibold text-center" style={{ color: colors.text }}>{title}</Text>
      {subtitle && (
        <Text className="text-sm text-center mt-2 leading-5" style={{ color: colors.textMuted }}>{subtitle}</Text>
      )}
    </View>
  );
}
