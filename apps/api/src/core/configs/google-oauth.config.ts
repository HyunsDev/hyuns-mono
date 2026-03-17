import { ConfigType, registerAs } from '@nestjs/config';
import { z } from 'zod';

const googleOAuthConfigSchema = z.object({
  GOOGLE_OAUTH_CLIENT_ID: z.string().min(1),
});

export const googleOAuthConfig = registerAs('googleOAuth', () => {
  const parsed = googleOAuthConfigSchema.parse(process.env);
  return {
    clientId: parsed.GOOGLE_OAUTH_CLIENT_ID,
  };
});

export type GoogleOAuthConfig = ConfigType<typeof googleOAuthConfig>;
