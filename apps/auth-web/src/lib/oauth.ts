const OAUTH_ERROR_MESSAGES: Record<string, string> = {
  access_denied: 'Google 로그인 승인이 취소되었습니다.',
  interaction_required: '추가 인증이 필요합니다. 다시 시도해주세요.',
  login_required: '로그인이 필요합니다. 다시 시도해주세요.',
};

export type OAuthCallbackResult =
  | { kind: 'success'; idToken: string }
  | { kind: 'error'; error: string; message: string }
  | { kind: 'empty' };

export function parseOAuthCallbackFragment(hash: string): OAuthCallbackResult {
  const fragment = hash.startsWith('#') ? hash.slice(1) : hash;

  if (!fragment) {
    return { kind: 'empty' };
  }

  const searchParams = new URLSearchParams(fragment);
  const idToken = searchParams.get('id_token');

  if (idToken) {
    return {
      kind: 'success',
      idToken,
    };
  }

  const error = searchParams.get('error');

  if (error) {
    return {
      kind: 'error',
      error,
      message: OAUTH_ERROR_MESSAGES[error] ?? 'Google 로그인 콜백을 처리하지 못했습니다.',
    };
  }

  return { kind: 'empty' };
}
