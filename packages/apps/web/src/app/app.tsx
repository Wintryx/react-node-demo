import { Navigate, Route, Routes } from 'react-router-dom';

import { AppProviders } from './providers';
import { LoginPage } from '../features/auth/login-page';
import { ProtectedRoute } from '../features/auth/protected-route';
import { PublicAuthRoute } from '../features/auth/public-auth-route';
import { RegisterPage } from '../features/auth/register-page';
import { DashboardPage } from '../features/dashboard/dashboard-page';

export function App() {
  return (
    <AppProviders>
      <Routes>
        <Route path="/" element={<Navigate to="/app" replace />} />
        <Route
          path="/login"
          element={
            <PublicAuthRoute>
              <LoginPage />
            </PublicAuthRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicAuthRoute>
              <RegisterPage />
            </PublicAuthRoute>
          }
        />
        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/app" replace />} />
      </Routes>
    </AppProviders>
  );
}

export default App;
