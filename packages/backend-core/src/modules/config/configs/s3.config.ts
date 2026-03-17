import { ConfigType, registerAs } from '@nestjs/config';
import { z } from 'zod';

export const s3ConfigSchema = z.object({
  AWS_REGION: z.string().min(1),
  AWS_S3_BUCKET_NAME: z.string().min(1),
  AWS_S3_PUBLIC_BASE_URL: z.url().optional(),
});

export const s3Config = registerAs('s3', () => {
  const parsed = s3ConfigSchema.parse(process.env);

  return {
    region: parsed.AWS_REGION,
    bucketName: parsed.AWS_S3_BUCKET_NAME,
    publicBaseUrl:
      parsed.AWS_S3_PUBLIC_BASE_URL ??
      `https://${parsed.AWS_S3_BUCKET_NAME}.s3.${parsed.AWS_REGION}.amazonaws.com`,
  };
});

export type S3Config = ConfigType<typeof s3Config>;
