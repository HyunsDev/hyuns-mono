import { randomUUID } from 'node:crypto';

import { Inject, Injectable } from '@nestjs/common';

import { googleOAuthConfig, GoogleOAuthConfig } from '@/core/configs';

interface GoogleJwtHeader {
  alg: string;
  kid: string;
  typ?: string;
}

interface GoogleJwtPayload {
  aud: string | string[];
  email?: string;
  email_verified?: boolean | string;
  exp: number;
  iat: number;
  iss: string;
  name?: string;
  nonce?: string;
  picture?: string;
  sub: string;
}

interface GoogleJwk {
  kid: string;
  kty: string;
  alg: string;
  use: string;
  n: string;
  e: string;
}

interface GoogleJwksResponse {
  keys: GoogleJwk[];
}

export interface VerifiedGoogleIdToken {
  sub: string;
  email: string;
  emailVerified: boolean;
  name: string | null;
  nonce: string | null;
  picture: string | null;
}

@Injectable()
export class GoogleIdTokenService {
  private jwkCache = new Map<string, CryptoKey>();
  private cacheExpiresAt = 0;

  constructor(
    @Inject(googleOAuthConfig.KEY)
    private readonly config: GoogleOAuthConfig,
  ) {}

  createNonce() {
    return randomUUID();
  }

  buildAuthorizationUrl(redirectUrl: string, nonce: string) {
    const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    url.searchParams.set('client_id', this.config.clientId);
    url.searchParams.set('redirect_uri', redirectUrl);
    url.searchParams.set('response_type', 'id_token');
    url.searchParams.set('scope', 'openid email profile');
    url.searchParams.set('nonce', nonce);
    url.searchParams.set('prompt', 'select_account');

    return url.toString();
  }

  assertAllowedRedirectUrl(redirectUrl: string) {
    if (!this.config.allowedRedirectUrls.includes(redirectUrl)) {
      throw new Error('Redirect URL is not allowed');
    }
  }

  async verifyIdToken(idToken: string, expectedNonce: string) {
    const [encodedHeader, encodedPayload, encodedSignature] = idToken.split('.');

    if (!encodedHeader || !encodedPayload || !encodedSignature) {
      throw new Error('Malformed ID token');
    }

    const header = JSON.parse(this.decodeBase64Url(encodedHeader)) as GoogleJwtHeader;
    const payload = JSON.parse(this.decodeBase64Url(encodedPayload)) as GoogleJwtPayload;

    if (header.alg !== 'RS256') {
      throw new Error('Unsupported Google ID token algorithm');
    }

    if (!payload.sub || !payload.exp || !payload.iss) {
      throw new Error('Malformed Google ID token payload');
    }

    if (!this.isValidIssuer(payload.iss)) {
      throw new Error('Invalid Google ID token issuer');
    }

    if (!this.isValidAudience(payload.aud)) {
      throw new Error('Invalid Google ID token audience');
    }

    if (payload.exp * 1000 <= Date.now()) {
      throw new Error('Expired Google ID token');
    }

    if (payload.nonce !== expectedNonce) {
      throw new Error('Invalid Google ID token nonce');
    }

    const key = await this.getGoogleKey(header.kid);
    const verified = await crypto.subtle.verify(
      'RSASSA-PKCS1-v1_5',
      key,
      this.decodeBase64UrlToUint8Array(encodedSignature),
      new TextEncoder().encode(`${encodedHeader}.${encodedPayload}`),
    );

    if (!verified) {
      throw new Error('Invalid Google ID token signature');
    }

    if (!payload.email) {
      throw new Error('Google ID token email is missing');
    }

    return {
      sub: payload.sub,
      email: payload.email,
      emailVerified: payload.email_verified === true || payload.email_verified === 'true',
      name: payload.name ?? null,
      nonce: payload.nonce ?? null,
      picture: payload.picture ?? null,
    } satisfies VerifiedGoogleIdToken;
  }

  private async getGoogleKey(kid: string) {
    if (this.jwkCache.has(kid) && this.cacheExpiresAt > Date.now()) {
      return this.jwkCache.get(kid)!;
    }

    const response = await fetch('https://www.googleapis.com/oauth2/v3/certs');

    if (!response.ok) {
      throw new Error('Failed to fetch Google public keys');
    }

    const jwks = (await response.json()) as GoogleJwksResponse;
    const maxAge = this.parseMaxAge(response.headers.get('cache-control'));
    this.jwkCache.clear();

    for (const jwk of jwks.keys) {
      const cryptoKey = await crypto.subtle.importKey(
        'jwk',
        jwk as JsonWebKey,
        {
          name: 'RSASSA-PKCS1-v1_5',
          hash: 'SHA-256',
        },
        false,
        ['verify'],
      );

      this.jwkCache.set(jwk.kid, cryptoKey);
    }

    this.cacheExpiresAt = Date.now() + maxAge * 1000;

    const key = this.jwkCache.get(kid);
    if (!key) {
      throw new Error('Matching Google public key not found');
    }

    return key;
  }

  private parseMaxAge(cacheControl: string | null) {
    if (!cacheControl) {
      return 300;
    }

    const matched = cacheControl.match(/max-age=(\d+)/);
    return matched ? Number(matched[1]) : 300;
  }

  private isValidAudience(aud: string | string[]) {
    return Array.isArray(aud) ? aud.includes(this.config.clientId) : aud === this.config.clientId;
  }

  private isValidIssuer(iss: string) {
    return iss === 'accounts.google.com' || iss === 'https://accounts.google.com';
  }

  private decodeBase64Url(value: string) {
    return Buffer.from(this.toBase64(value), 'base64').toString('utf8');
  }

  private decodeBase64UrlToUint8Array(value: string) {
    return new Uint8Array(Buffer.from(this.toBase64(value), 'base64'));
  }

  private toBase64(value: string) {
    return value.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(value.length / 4) * 4, '=');
  }
}
