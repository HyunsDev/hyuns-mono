import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom';

import { LoadingView } from '@/components/LoadingView';
import { AuthSessionProvider, useAuthSession } from '@/features/auth/auth-session';
import { LoginPage } from '@/pages/LoginPage';
import { OAuthCallbackPage } from '@/pages/OAuthCallbackPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { SessionsPage } from '@/pages/SessionsPage';

function AppFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-svh bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.16),_transparent_36%),linear-gradient(180deg,_rgba(248,250,252,1)_0%,_rgba(241,245,249,1)_100%)]">
      {children}
    </div>
  );
}

export function RootRedirect() {
  const { status } = useAuthSession();

  if (status === 'loading') {
    return <LoadingView />;
  }

  return <Navigate to={status === 'authenticated' ? '/profile' : '/login'} replace />;
}

export function ProtectedRoute() {
  const { status } = useAuthSession();

  if (status === 'loading') {
    return <LoadingView />;
  }

  if (status !== 'authenticated') {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export function PublicOnlyRoute() {
  const { status } = useAuthSession();

  if (status === 'loading') {
    return <LoadingView description="기존 로그인 상태를 확인하고 있습니다." />;
  }

  if (status === 'authenticated') {
    return <Navigate to="/profile" replace />;
  }

  return <Outlet />;
}

export function AppRoutes() {
  return (
    <AppFrame>
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>
        <Route path="/auth/callback" element={<OAuthCallbackPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/sessions" element={<SessionsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppFrame>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <AuthSessionProvider>
        <AppRoutes />
      </AuthSessionProvider>
    </BrowserRouter>
  );
}
