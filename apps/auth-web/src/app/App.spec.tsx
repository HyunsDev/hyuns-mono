import { ReactNode } from 'react';

import { render, screen } from '@testing-library/react';
import { MemoryRouter, Outlet, Route, Routes } from 'react-router-dom';

import { ProtectedRoute, PublicOnlyRoute } from './App';

import { AuthSessionContext, type AuthSessionContextValue } from '@/features/auth/auth-session';


const defaultContextValue: AuthSessionContextValue = {
  clearSession: () => undefined,
  errorMessage: null,
  refreshSession: async () => null,
  setAuthenticatedUser: () => undefined,
  status: 'anonymous',
  user: null,
};

function renderWithAuth(path: string, contextValue: Partial<AuthSessionContextValue>, children: ReactNode) {
  return render(
    <AuthSessionContext.Provider value={{ ...defaultContextValue, ...contextValue }}>
      <MemoryRouter initialEntries={[path]}>{children}</MemoryRouter>
    </AuthSessionContext.Provider>,
  );
}

describe('App routes', () => {
  it('redirects anonymous users away from protected routes', async () => {
    renderWithAuth(
      '/profile',
      { status: 'anonymous' },
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route path="/profile" element={<div>Protected</div>} />
        </Route>
        <Route path="/login" element={<div>Login</div>} />
      </Routes>,
    );

    expect(await screen.findByText('Login')).toBeInTheDocument();
  });

  it('redirects authenticated users away from the login route', async () => {
    renderWithAuth(
      '/login',
      {
        status: 'authenticated',
        user: {
          avatarUrl: null,
          createdAt: new Date().toISOString(),
          email: 'user@example.com',
          id: '8eb5d4bb-5c58-45c8-a8eb-c09afb437caa',
          name: 'Tester',
          role: 'user',
          status: 'active',
        },
      },
      <Routes>
        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<div>Login</div>} />
        </Route>
        <Route path="/profile" element={<div>Profile</div>} />
      </Routes>,
    );

    expect(await screen.findByText('Profile')).toBeInTheDocument();
  });

  it('renders nested protected content for authenticated users', async () => {
    renderWithAuth(
      '/profile',
      {
        status: 'authenticated',
        user: {
          avatarUrl: null,
          createdAt: new Date().toISOString(),
          email: 'user@example.com',
          id: '8eb5d4bb-5c58-45c8-a8eb-c09afb437caa',
          name: 'Tester',
          role: 'user',
          status: 'active',
        },
      },
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route element={<Outlet />}>
            <Route path="/profile" element={<div>Protected</div>} />
          </Route>
        </Route>
      </Routes>,
    );

    expect(await screen.findByText('Protected')).toBeInTheDocument();
  });
});
