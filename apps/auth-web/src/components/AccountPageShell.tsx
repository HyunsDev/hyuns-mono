import { useState } from 'react';

import { useNavigate } from 'react-router-dom';

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Button,
  CenterPage,
  Separator,
} from '@workspace/ui';

import { AppNavigation } from './AppNavigation';
import { StatusAlert } from './StatusAlert';

import { useAuthSession } from '@/features/auth/auth-session';
import { apiClient } from '@/lib/api/client';
import { getErrorMessage, ensureApiSuccess } from '@/lib/api/errors';
import { getInitials } from '@/lib/format';


interface AccountPageShellProps {
  children: React.ReactNode;
  description: string;
  title: string;
}

export function AccountPageShell({
  children,
  description,
  title,
}: AccountPageShellProps) {
  const navigate = useNavigate();
  const { clearSession, user } = useAuthSession();
  const [logoutError, setLogoutError] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    setLogoutError(null);

    try {
      const response = await apiClient.auth.logout();
      ensureApiSuccess(response, '로그아웃에 실패했습니다.');
      clearSession();
      navigate('/login', { replace: true });
    } catch (error) {
      setLogoutError(getErrorMessage(error, '로그아웃에 실패했습니다.'));
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <CenterPage
      title={title}
      description={description}
      headerAction={user ? <Badge variant="outline">{user.role}</Badge> : null}
      cardClassName="mx-auto max-w-5xl"
    >
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-3">
            <AppNavigation />
            {logoutError ? (
              <StatusAlert
                title="로그아웃 실패"
                description={logoutError}
                variant="destructive"
              />
            ) : null}
          </div>
          {user ? (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/70 bg-muted/30 px-4 py-3">
              <div className="flex items-center gap-3">
                <Avatar className="size-10 border border-border/70">
                  {user.avatarUrl ? <AvatarImage src={user.avatarUrl} alt={user.name} /> : null}
                  <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{user.name}</p>
                  <p className="text-muted-foreground truncate text-sm">{user.email}</p>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => void handleLogout()}
                disabled={isLoggingOut}
              >
                {isLoggingOut ? '로그아웃 중...' : '로그아웃'}
              </Button>
            </div>
          ) : null}
        </div>
        <Separator />
        {children}
      </div>
    </CenterPage>
  );
}
