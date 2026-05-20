import React from 'react';
import { Text, View } from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';

const ComingSoonScreen = () => {
  const { colors } = useAppTheme();

  return (
    <View className="flex-1 justify-center items-center p-4" style={{ backgroundColor: colors.bg }}>
      <Text className="text-4xl mb-4">🚧</Text>
      <Text className="text-lg font-bold mb-2" style={{ color: colors.text }}>Coming Soon</Text>
      <Text className="text-sm" style={{ color: colors.textMuted }}>This feature is under development.</Text>
    </View>
  );
};

export default ComingSoonScreen;
