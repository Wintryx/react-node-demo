import { Dispatch, SetStateAction, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { authSessionManager } from './auth-session-manager';
import { AuthSession } from './auth-storage';
import { setUnauthorizedHandler } from '../../shared/api/unauthorized-handler';

export const useUnauthorizedRedirect = (
  setSession: Dispatch<SetStateAction<AuthSession | null>>,
): void => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setUnauthorizedHandler(() => {
      authSessionManager.clear();
      setSession(null);

      if (location.pathname === '/login' || location.pathname === '/register') {
        return;
      }

      navigate('/login', {
        replace: true,
        state: {
          from: location.pathname,
        },
      });
    });

    return () => {
      setUnauthorizedHandler(null);
    };
  }, [location.pathname, navigate, setSession]);
};
