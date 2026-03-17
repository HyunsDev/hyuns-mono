import { parseOAuthCallbackFragment } from './oauth';

describe('parseOAuthCallbackFragment', () => {
  it('parses an id token from the fragment', () => {
    expect(parseOAuthCallbackFragment('#id_token=test-token')).toEqual({
      kind: 'success',
      idToken: 'test-token',
    });
  });

  it('returns an error state when Google reports one', () => {
    expect(parseOAuthCallbackFragment('#error=access_denied')).toEqual({
      kind: 'error',
      error: 'access_denied',
      message: 'Google 로그인 승인이 취소되었습니다.',
    });
  });

  it('returns empty when the fragment is blank', () => {
    expect(parseOAuthCallbackFragment('')).toEqual({
      kind: 'empty',
    });
  });
});
