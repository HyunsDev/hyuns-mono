import { ConfigType, registerAs } from '@nestjs/config';
import { z } from 'zod';

export const sessionConfigSchema = z.object({
  SESSION_COOKIE_NAME: z.string().min(1).default('hyuns_session'),
  SESSION_TTL_SECONDS: z.coerce.number().int().positive().default(60 * 60 * 24 * 30),
  SESSION_COOKIE_SECURE: z.enum(['true', 'false']).default('false'),
  SESSION_COOKIE_SAME_SITE: z.enum(['strict', 'lax', 'none']).default('lax'),
});

export const sessionConfig = registerAs('session', () => {
  const parsed = sessionConfigSchema.parse(process.env);

  return {
    cookieName: parsed.SESSION_COOKIE_NAME,
    ttlSeconds: parsed.SESSION_TTL_SECONDS,
    cookieSecure: parsed.SESSION_COOKIE_SECURE === 'true',
    cookieSameSite: parsed.SESSION_COOKIE_SAME_SITE,
  };
});

export type SessionConfig = ConfigType<typeof sessionConfig>;
