import { useState } from 'react';

import { Button, CenterPage } from '@workspace/ui';

import { StatusAlert } from '@/components/StatusAlert';
import { useAuthSession } from '@/features/auth/auth-session';
import { apiClient } from '@/lib/api/client';
import { getErrorMessage, unwrapApiData } from '@/lib/api/errors';


export function LoginPage() {
  const { errorMessage } = useAuthSession();
  const [isPending, setIsPending] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const handleLogin = async () => {
    setIsPending(true);
    setLoginError(null);

    try {
      const response = await apiClient.auth.oauth.start({
        body: {
          provider: 'google',
          redirectUrl: `${window.location.origin}/auth/callback`,
        },
      });
      const { authorizationUrl } = unwrapApiData<{ authorizationUrl: string }>(
        response,
        'Google 로그인을 시작하지 못했습니다.',
      );

      window.location.assign(authorizationUrl);
    } catch (error) {
      setLoginError(getErrorMessage(error, 'Google 로그인을 시작하지 못했습니다.'));
      setIsPending(false);
    }
  };

  return (
    <CenterPage
      title="계정 로그인"
      description="Google OAuth로 로그인하고 쿠키 세션으로 안전하게 인증 상태를 유지합니다."
      cardClassName="mx-auto max-w-xl"
    >
      <div className="flex flex-col gap-5">
        <div className="space-y-2">
          <p className="text-sm leading-6">
            로그인 후에는 프로필 편집, 현재 활성 세션 조회, 다른 기기 세션 종료 기능을 바로 사용할
            수 있습니다.
          </p>
          <p className="text-muted-foreground text-sm">
            개발 환경에서는 API 서버의{' '}
            <code className="rounded bg-muted px-1 py-0.5 text-xs">
              GOOGLE_OAUTH_ALLOWED_REDIRECT_URLS
            </code>
            에{' '}
            <code className="rounded bg-muted px-1 py-0.5 text-xs">
              http://localhost:5173/auth/callback
            </code>
            이 포함되어야 합니다.
          </p>
        </div>
        {errorMessage ? (
          <StatusAlert
            title="세션 확인 실패"
            description={errorMessage}
            variant="destructive"
          />
        ) : null}
        {loginError ? (
          <StatusAlert
            title="로그인 시작 실패"
            description={loginError}
            variant="destructive"
          />
        ) : null}
        <Button
          type="button"
          size="lg"
          className="w-full"
          disabled={isPending}
          onClick={() => void handleLogin()}
        >
          {isPending ? 'Google로 이동 중...' : 'Google로 로그인'}
        </Button>
      </div>
    </CenterPage>
  );
}
