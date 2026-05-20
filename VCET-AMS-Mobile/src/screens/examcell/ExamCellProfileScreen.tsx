import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useAuthStore } from '../../store/auth';
import { useAppTheme } from '../../hooks/useAppTheme';
import Card from '../../components/Card';

export default function ExamCellProfileScreen() {
  const { user, logout } = useAuthStore();
  const { colors } = useAppTheme();

  return (
    <View className="flex-1 p-4" style={{ backgroundColor: colors.bg }}>
      <Card className="mb-4" style={{ backgroundColor: colors.bgCard, borderColor: colors.border, borderWidth: 1 }}>
        <View className="items-center mb-4 pt-4">
          <View className="w-20 h-20 rounded-full bg-blue-600 items-center justify-center mb-3">
            <Text className="text-white text-2xl font-bold">
              {user?.name?.split(' ').map((s) => s[0]).join('').slice(0, 2) ?? 'EC'}
            </Text>
          </View>
          <Text className="text-xl font-bold" style={{ color: colors.text }}>{user?.name}</Text>
          <Text className="text-sm font-mono mt-1" style={{ color: colors.textMuted }}>{user?.usn}</Text>
          <View className="mt-2 px-4 py-1 rounded-full bg-blue-600">
            <Text className="text-white text-xs font-bold">EXAM_CELL</Text>
          </View>
        </View>
      </Card>

      <TouchableOpacity
        onPress={logout}
        className="bg-red-600 rounded-xl py-4 items-center mt-4"
      >
        <Text className="text-white font-bold text-lg">Logout</Text>
      </TouchableOpacity>
    </View>
  );
}
