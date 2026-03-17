import type { ButtonHTMLAttributes, ReactNode } from 'react';

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';

import { SessionsPage } from './SessionsPage';

import { AuthSessionContext, type AuthSessionContextValue } from '@/features/auth/auth-session';


const mockListSessions = vi.fn();
const mockDeleteSession = vi.fn();
const mockLogout = vi.fn();

vi.mock('@workspace/ui', async () => {
  const actual = await vi.importActual<typeof import('@workspace/ui')>('@workspace/ui');

  return {
    ...actual,
    AlertDialog: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    AlertDialogAction: ({
      children,
      ...props
    }: ButtonHTMLAttributes<HTMLButtonElement>) => (
      <button type="button" {...props}>
        {children}
      </button>
    ),
    AlertDialogCancel: ({
      children,
      ...props
    }: ButtonHTMLAttributes<HTMLButtonElement>) => (
      <button type="button" {...props}>
        {children}
      </button>
    ),
    AlertDialogContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    AlertDialogDescription: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    AlertDialogFooter: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    AlertDialogHeader: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    AlertDialogTitle: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    AlertDialogTrigger: ({ children }: { children: ReactNode }) => <>{children}</>,
  };
});

vi.mock('@/lib/api/client', () => ({
  apiClient: {
    auth: {
      logout: (...args: unknown[]) => mockLogout(...args),
    },
    me: {
      sessions: {
        delete: (...args: unknown[]) => mockDeleteSession(...args),
        list: (...args: unknown[]) => mockListSessions(...args),
      },
    },
  },
}));

const authContextValue: AuthSessionContextValue = {
  clearSession: () => undefined,
  errorMessage: null,
  refreshSession: async () => null,
  setAuthenticatedUser: () => undefined,
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
};

describe('SessionsPage', () => {
  beforeEach(() => {
    mockDeleteSession.mockReset();
    mockListSessions.mockReset();
    mockLogout.mockReset();
  });

  it('disables the current session button and refreshes after deleting another session', async () => {
    mockListSessions
      .mockResolvedValueOnce({
        status: 200,
        body: {
          data: [
            {
              createdAt: '2026-03-17T10:00:00.000Z',
              device: 'Desktop',
              isCurrent: true,
              name: 'Safari on macOS',
              os: 'macOS',
              sessionId: '4b76f18a-4f0e-4ef9-9082-b356f133a0d0',
              userAgent: 'Safari',
              userId: '8eb5d4bb-5c58-45c8-a8eb-c09afb437caa',
            },
            {
              createdAt: '2026-03-17T09:00:00.000Z',
              device: 'Desktop',
              isCurrent: false,
              name: 'Chrome on macOS',
              os: 'macOS',
              sessionId: '1ca18022-becb-4d89-bf3a-e3b834616427',
              userAgent: 'Chrome',
              userId: '8eb5d4bb-5c58-45c8-a8eb-c09afb437caa',
            },
          ],
          meta: {},
        },
      })
      .mockResolvedValueOnce({
        status: 200,
        body: {
          data: [
            {
              createdAt: '2026-03-17T10:00:00.000Z',
              device: 'Desktop',
              isCurrent: true,
              name: 'Safari on macOS',
              os: 'macOS',
              sessionId: '4b76f18a-4f0e-4ef9-9082-b356f133a0d0',
              userAgent: 'Safari',
              userId: '8eb5d4bb-5c58-45c8-a8eb-c09afb437caa',
            },
            {
              createdAt: '2026-03-17T09:00:00.000Z',
              device: 'Desktop',
              isCurrent: false,
              name: 'Chrome on macOS',
              os: 'macOS',
              sessionId: '1ca18022-becb-4d89-bf3a-e3b834616427',
              userAgent: 'Chrome',
              userId: '8eb5d4bb-5c58-45c8-a8eb-c09afb437caa',
            },
          ],
          meta: {},
        },
      })
      .mockResolvedValueOnce({
        status: 200,
        body: {
          data: [
            {
              createdAt: '2026-03-17T10:00:00.000Z',
              device: 'Desktop',
              isCurrent: true,
              name: 'Safari on macOS',
              os: 'macOS',
              sessionId: '4b76f18a-4f0e-4ef9-9082-b356f133a0d0',
              userAgent: 'Safari',
              userId: '8eb5d4bb-5c58-45c8-a8eb-c09afb437caa',
            },
          ],
          meta: {},
        },
      });
    mockDeleteSession.mockResolvedValue({
      status: 200,
      body: {
        data: {
          success: true,
        },
        meta: {},
      },
    });

    render(
      <AuthSessionContext.Provider value={authContextValue}>
        <MemoryRouter>
          <SessionsPage />
        </MemoryRouter>
      </AuthSessionContext.Provider>,
    );

    expect(await screen.findByText('Safari on macOS')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '현재 세션' })).toBeDisabled();
    expect(screen.getByText('세션을 종료할까요?')).toBeInTheDocument();

    fireEvent.click(screen.getAllByRole('button', { name: '세션 종료' })[1]!);

    await waitFor(() => {
      expect(mockDeleteSession).toHaveBeenCalledWith({
        params: {
          sessionId: '1ca18022-becb-4d89-bf3a-e3b834616427',
        },
      });
    });

    await waitFor(() => {
      expect(mockListSessions.mock.calls.length).toBeGreaterThanOrEqual(2);
    });

    expect(screen.queryByText('Chrome on macOS')).not.toBeInTheDocument();
  });
});
