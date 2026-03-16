import { type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

import { useAuth } from './auth-context';
import { Spinner } from '../../components/ui/spinner';

interface PublicAuthRouteProps {
  children: ReactNode;
}

export function PublicAuthRoute({ children }: PublicAuthRouteProps) {
  const { isAuthenticated, isInitializing } = useAuth();

  if (isInitializing) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner className="h-8 w-8 text-primary" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/app" replace />;
  }

  return <>{children}</>;
}
