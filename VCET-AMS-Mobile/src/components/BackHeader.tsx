import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

type BackHeaderProps = {
  title?: string;
};

export default function BackHeader({ title }: BackHeaderProps) {
  const navigation = useNavigation<any>();

  return (
    <View className="flex-row items-center px-4 py-3 bg-slate-950 border-b border-slate-800">
      <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3">
        <Text className="text-blue-400 text-base">← Back</Text>
      </TouchableOpacity>
      {title && <Text className="text-white text-sm font-medium flex-1">{title}</Text>}
    </View>
  );
}
