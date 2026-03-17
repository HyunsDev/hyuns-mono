import {
  createContext,
  startTransition,
  use,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { UserDto } from '@workspace/contract';

import { apiClient, type ApiClient } from '@/lib/api/client';
import { getErrorMessage, isAuthError, unwrapApiData } from '@/lib/api/errors';

export type AuthSessionStatus = 'loading' | 'authenticated' | 'anonymous';

interface AuthSessionSnapshot {
  errorMessage: string | null;
  status: AuthSessionStatus;
  user: UserDto | null;
}

let bootstrapSnapshot: AuthSessionSnapshot | null = null;
let bootstrapSnapshotPromise: Promise<AuthSessionSnapshot> | null = null;

export interface AuthSessionContextValue {
  clearSession: () => void;
  errorMessage: string | null;
  refreshSession: () => Promise<UserDto | null>;
  setAuthenticatedUser: (user: UserDto) => void;
  status: AuthSessionStatus;
  user: UserDto | null;
}

export const AuthSessionContext = createContext<AuthSessionContextValue | null>(null);

interface AuthSessionProviderProps {
  children: React.ReactNode;
  client?: ApiClient;
}

const createAnonymousSnapshot = (errorMessage: string | null): AuthSessionSnapshot => ({
  errorMessage,
  status: 'anonymous',
  user: null,
});

const createAuthenticatedSnapshot = (user: UserDto): AuthSessionSnapshot => ({
  errorMessage: null,
  status: 'authenticated',
  user,
});

export function AuthSessionProvider({
  children,
  client = apiClient,
}: AuthSessionProviderProps) {
  const [status, setStatus] = useState<AuthSessionStatus>('loading');
  const [user, setUser] = useState<UserDto | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const hasInitializedRef = useRef(false);

  const applySnapshot = useCallback((snapshot: AuthSessionSnapshot) => {
    startTransition(() => {
      setUser(snapshot.user);
      setStatus(snapshot.status);
      setErrorMessage(snapshot.errorMessage);
    });
  }, []);

  const fetchSessionSnapshot = useCallback(async () => {
    try {
      const response = await client.me.get();
      const currentUser = unwrapApiData<UserDto>(
        response,
        '로그인 세션을 불러오지 못했습니다.',
      );
      return createAuthenticatedSnapshot(currentUser);
    } catch (error) {
      return createAnonymousSnapshot(
        isAuthError(error) ? null : getErrorMessage(error, '세션 상태를 확인하지 못했습니다.'),
      );
    }
  }, [client]);

  const loadSession = useCallback(
    async (force = false) => {
      if (!force && bootstrapSnapshot) {
        applySnapshot(bootstrapSnapshot);
        return bootstrapSnapshot.user;
      }

      if (!force && bootstrapSnapshotPromise) {
        const snapshot = await bootstrapSnapshotPromise;
        applySnapshot(snapshot);
        return snapshot.user;
      }

      const snapshotPromise = fetchSessionSnapshot().then((snapshot) => {
        bootstrapSnapshot = snapshot;
        bootstrapSnapshotPromise = null;
        return snapshot;
      });

      bootstrapSnapshotPromise = snapshotPromise;

      const snapshot = await snapshotPromise;
      applySnapshot(snapshot);
      return snapshot.user;
    },
    [applySnapshot, fetchSessionSnapshot],
  );

  const updateSnapshot = useCallback((snapshot: AuthSessionSnapshot) => {
    bootstrapSnapshot = snapshot;
    bootstrapSnapshotPromise = null;
    applySnapshot(snapshot);
  }, [applySnapshot]);

  const clearSession = useCallback(() => {
    updateSnapshot(createAnonymousSnapshot(null));
  }, [updateSnapshot]);

  const setAuthenticatedUser = useCallback((nextUser: UserDto) => {
    updateSnapshot(createAuthenticatedSnapshot(nextUser));
  }, [updateSnapshot]);

  useEffect(() => {
    if (hasInitializedRef.current) {
      return;
    }

    hasInitializedRef.current = true;
    void loadSession();
  }, [loadSession]);

  const value = useMemo<AuthSessionContextValue>(
    () => ({
      clearSession,
      errorMessage,
      refreshSession: async () => loadSession(true),
      setAuthenticatedUser,
      status,
      user,
    }),
    [clearSession, errorMessage, loadSession, setAuthenticatedUser, status, user],
  );

  return <AuthSessionContext.Provider value={value}>{children}</AuthSessionContext.Provider>;
}

export function useAuthSession() {
  const context = use(AuthSessionContext);

  if (!context) {
    throw new Error('useAuthSession must be used within an AuthSessionProvider');
  }

  return context;
}
