import React from 'react';
import { View, Text, ScrollView, Switch } from 'react-native';
import { useAuthStore } from '../../store/auth';
import { useAppTheme } from '../../hooks/useAppTheme';
import Card from '../../components/Card';
import Button from '../../components/Button';

const AdminProfileScreen = () => {
  const { user, logout } = useAuthStore();
  const { colors, isDark, toggleTheme } = useAppTheme();

  return (
    <ScrollView className="flex-1" style={{ backgroundColor: colors.bg }} contentContainerStyle={{ padding: 16 }}>
      <View className="items-center mb-6 mt-4">
        <View className="w-20 h-20 rounded-full bg-emerald-600 items-center justify-center mb-3">
          <Text className="text-white text-3xl font-bold">
            {user?.name?.split(' ').map((s) => s[0]).join('').slice(0, 2) ?? '?'}
          </Text>
        </View>
        <Text className="text-2xl font-bold" style={{ color: colors.text }}>{user?.name}</Text>
        <Text className="text-sm mt-1" style={{ color: colors.textMuted }}>{user?.email}</Text>
      </View>
      <Card className="mb-4">
        <Text className="font-bold text-lg mb-3" style={{ color: colors.text }}>Info</Text>
        <View className="gap-2">
          <InfoRow label="Role" value="System Administrator" colors={colors} />
          <InfoRow label="Phone" value={user?.phone ?? 'N/A'} colors={colors} />
        </View>
      </Card>

      <Card className="mb-4">
        <Text className="font-bold text-lg mb-3" style={{ color: colors.text }}>Appearance</Text>
        <View className="flex-row items-center justify-between py-2">
          <View>
            <Text className="font-medium" style={{ color: colors.text }}>Dark Mode</Text>
            <Text className="text-xs mt-0.5" style={{ color: colors.textMuted }}>
              {isDark ? 'Dark theme active' : 'Light theme active'}
            </Text>
          </View>
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            trackColor={{ false: colors.border, true: colors.accentAdmin }}
            thumbColor={isDark ? '#FFFFFF' : '#F4F3F4'}
          />
        </View>
      </Card>

      <Button title="Logout" onPress={logout} variant="danger" />
    </ScrollView>
  );
};

const InfoRow = ({ label, value, colors }: { label: string; value: string; colors: any }) => (
  <View className="flex-row justify-between items-center py-1.5">
    <Text className="text-sm" style={{ color: colors.textMuted }}>{label}</Text>
    <Text className="text-sm font-medium" style={{ color: colors.text }}>{value}</Text>
  </View>
);

export default AdminProfileScreen;
