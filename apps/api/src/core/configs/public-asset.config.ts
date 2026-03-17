import { ConfigType, registerAs } from '@nestjs/config';
import { z } from 'zod';

const publicAssetConfigSchema = z.object({
  PUBLIC_ASSET_BASE_URL: z.url().optional(),
});

export const publicAssetConfig = registerAs('publicAsset', () => {
  const parsed = publicAssetConfigSchema.parse(process.env);
  return {
    baseUrl: parsed.PUBLIC_ASSET_BASE_URL,
  };
});

export type PublicAssetConfig = ConfigType<typeof publicAssetConfig>;
