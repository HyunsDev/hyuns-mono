import { useEffect, useState } from 'react';

import { useNavigate } from 'react-router-dom';

import { Button, CenterPage, Spinner } from '@workspace/ui';

import { StatusAlert } from '@/components/StatusAlert';
import { useAuthSession } from '@/features/auth/auth-session';
import { apiClient } from '@/lib/api/client';
import { ensureApiSuccess, getErrorMessage } from '@/lib/api/errors';
import { parseOAuthCallbackFragment } from '@/lib/oauth';


export function OAuthCallbackPage() {
  const navigate = useNavigate();
  const { refreshSession } = useAuthSession();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const result = parseOAuthCallbackFragment(window.location.hash);

    const completeCallback = async () => {
      try {
        if (result.kind === 'error') {
          throw new Error(result.message);
        }

        if (result.kind === 'empty') {
          throw new Error('Google 로그인 응답에 필요한 토큰이 없습니다.');
        }

        const response = await apiClient.auth.oauth.googleCallback({
          body: {
            idToken: result.idToken,
          },
        });

        ensureApiSuccess(response, 'Google 로그인 콜백을 처리하지 못했습니다.');

        const user = await refreshSession();

        if (!user) {
          throw new Error('로그인 세션을 다시 불러오지 못했습니다.');
        }

        navigate('/profile', { replace: true });
      } catch (error) {
        setErrorMessage(getErrorMessage(error, 'Google 로그인에 실패했습니다.'));
      } finally {
        window.history.replaceState(
          {},
          document.title,
          `${window.location.pathname}${window.location.search}`,
        );
        setIsProcessing(false);
      }
    };

    void completeCallback();
  }, [navigate, refreshSession]);

  return (
    <CenterPage
      title="Google 로그인 처리"
      description="콜백 결과를 확인하고 로그인 세션을 생성하고 있습니다."
      cardClassName="mx-auto max-w-xl"
    >
      <div className="flex flex-col gap-4">
        {isProcessing ? (
          <div className="flex min-h-32 items-center justify-center">
            <Spinner className="size-6" />
          </div>
        ) : errorMessage ? (
          <>
            <StatusAlert
              title="로그인 실패"
              description={errorMessage}
              variant="destructive"
            />
            <Button type="button" onClick={() => navigate('/login', { replace: true })}>
              로그인 화면으로 돌아가기
            </Button>
          </>
        ) : null}
      </div>
    </CenterPage>
  );
}
