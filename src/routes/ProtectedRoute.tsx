import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import type { ApiUser, Session } from '../types/auth';
import { getHomePath } from './routeUtils';

export const ProtectedRoute = ({
  session,
  allowedRoles,
  children,
}: {
  session: Session | null;
  allowedRoles?: ApiUser['rol'][];
  children: ReactNode;
}) => {
  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(session.user.rol)) {
    return <Navigate to={getHomePath(session.user.rol)} replace />;
  }

  return children;
};

export const PublicRoute = ({ session, children }: { session: Session | null; children: ReactNode }) => {
  if (session) {
    return <Navigate to={getHomePath(session.user.rol)} replace />;
  }

  return children;
};
