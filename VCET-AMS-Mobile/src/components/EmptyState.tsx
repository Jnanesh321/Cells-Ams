import React from 'react';
import { Text, View } from 'react-native';

type EmptyStateProps = {
  icon?: string;
  title: string;
  subtitle?: string;
};

export default function EmptyState({ icon = '📭', title, subtitle }: EmptyStateProps) {
  return (
    <View className="flex-1 justify-center items-center px-8 py-16">
      <Text className="text-4xl mb-4">{icon}</Text>
      <Text className="text-white text-lg font-semibold text-center">{title}</Text>
      {subtitle && (
        <Text className="text-slate-400 text-sm text-center mt-2 leading-5">{subtitle}</Text>
      )}
    </View>
  );
}
