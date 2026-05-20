import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppTheme } from '../hooks/useAppTheme';

type BackHeaderProps = {
  title?: string;
};

export default function BackHeader({ title }: BackHeaderProps) {
  const navigation = useNavigation<any>();
  const { colors } = useAppTheme();

  return (
    <View
      className="flex-row items-center px-4 py-3 border-b"
      style={{ backgroundColor: colors.bg, borderBottomColor: colors.border }}
    >
      <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3">
        <Text style={{ color: colors.accentStudent }} className="text-base">← Back</Text>
      </TouchableOpacity>
      {title && <Text className="text-sm font-medium flex-1" style={{ color: colors.text }}>{title}</Text>}
    </View>
  );
}
