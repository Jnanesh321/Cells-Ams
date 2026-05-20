import React from 'react';
import { Text, View } from 'react-native';
import { useAuthStore } from '../store/auth';
import { useAppTheme } from '../hooks/useAppTheme';
import type { UserRole } from '../types';

type RoleGuardProps = {
  allowedRoles: UserRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
};

export default function RoleGuard({ allowedRoles, children, fallback }: RoleGuardProps) {
  const { user } = useAuthStore();
  const { colors } = useAppTheme();

  if (!user || !allowedRoles.includes(user.role)) {
    if (fallback) return <>{fallback}</>;
    return (
      <View className="flex-1 justify-center items-center p-4" style={{ backgroundColor: colors.bg }}>
        <Text className="text-lg text-center" style={{ color: colors.textMuted }}>Access restricted</Text>
        <Text className="text-sm text-center mt-2" style={{ color: colors.textTertiary }}>
          You do not have permission to view this content.
        </Text>
      </View>
    );
  }

  return <>{children}</>;
}
