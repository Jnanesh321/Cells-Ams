import { useMemo } from 'react';
import { useAuthStore } from '../store/auth';
import type { UserRole } from '../types';

export function useRoleGuard(allowedRoles: UserRole[]) {
  const { user } = useAuthStore();

  return useMemo(() => {
    const role = user?.role ?? null;
    return {
      isAllowed: role ? allowedRoles.includes(role) : false,
      role,
      allowedRoles,
    };
  }, [user?.role, allowedRoles]);
}
