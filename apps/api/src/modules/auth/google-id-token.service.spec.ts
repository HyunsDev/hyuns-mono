import { GoogleIdTokenService } from './google-id-token.service';

describe('GoogleIdTokenService', () => {
  const service = new GoogleIdTokenService({
    clientId: 'client-id',
    allowedRedirectUrls: ['http://localhost:3000/auth/callback'],
  });

  it('builds a Google authorization url with the redirect url and nonce', () => {
    const authorizationUrl = service.buildAuthorizationUrl(
      'http://localhost:3000/auth/callback',
      'nonce-value',
    );

    const url = new URL(authorizationUrl);

    expect(url.origin).toBe('https://accounts.google.com');
    expect(url.searchParams.get('client_id')).toBe('client-id');
    expect(url.searchParams.get('redirect_uri')).toBe('http://localhost:3000/auth/callback');
    expect(url.searchParams.get('response_type')).toBe('id_token');
    expect(url.searchParams.get('nonce')).toBe('nonce-value');
  });

  it('allows only configured redirect urls', () => {
    expect(() =>
      service.assertAllowedRedirectUrl('http://localhost:3000/auth/callback'),
    ).not.toThrow();

    expect(() => service.assertAllowedRedirectUrl('http://localhost:4000/other')).toThrow(
      'Redirect URL is not allowed',
    );
  });
});
