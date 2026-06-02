import type { ApiUser, UserType, View } from '../types/auth';

export const isManagerRole = (role: ApiUser['rol']) => role === 'admin' || role === 'supervisor';

export const getUserType = (role?: ApiUser['rol']): UserType => role && isManagerRole(role) ? 'manager' : 'employee';

export const getHomePath = (role?: ApiUser['rol']) => isManagerRole(role || 'empleado') ? '/manager' : '/dashboard';

export const getViewPath = (view: View, userType: UserType) => {
  if (view === 'login') return '/login';
  if (view === 'dashboard') return userType === 'manager' ? '/manager' : '/dashboard';
  if (view === 'manager') return '/manager';
  return `/${view}`;
};

export const getViewFromPath = (pathname: string): View => {
  const firstSegment = pathname.split('/').filter(Boolean)[0] as View | undefined;

  if (!firstSegment) return 'login';

  return firstSegment;
};
