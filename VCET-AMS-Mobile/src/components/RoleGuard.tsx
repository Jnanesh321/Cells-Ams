import React from 'react';
import { Text, View } from 'react-native';
import { useAuthStore } from '../store/auth';
import type { UserRole } from '../types';

type RoleGuardProps = {
  allowedRoles: UserRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
};

export default function RoleGuard({ allowedRoles, children, fallback }: RoleGuardProps) {
  const { user } = useAuthStore();

  if (!user || !allowedRoles.includes(user.role)) {
    if (fallback) return <>{fallback}</>;
    return (
      <View className="flex-1 bg-slate-950 justify-center items-center p-4">
        <Text className="text-slate-400 text-lg text-center">Access restricted</Text>
        <Text className="text-slate-600 text-sm text-center mt-2">
          You do not have permission to view this content.
        </Text>
      </View>
    );
  }

  return <>{children}</>;
}
