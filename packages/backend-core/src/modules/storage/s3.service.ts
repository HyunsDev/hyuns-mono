import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Inject, Injectable } from '@nestjs/common';

import { s3Config, S3Config } from '@/modules/config';

interface UploadObjectInput {
  key: string;
  body: Buffer;
  contentType: string;
}

@Injectable()
export class S3Service {
  private readonly client: S3Client;

  constructor(
    @Inject(s3Config.KEY)
    private readonly config: S3Config,
  ) {
    this.client = new S3Client({
      region: config.region,
    });
  }

  async uploadObject(input: UploadObjectInput) {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.config.bucketName,
        Key: input.key,
        Body: input.body,
        ContentType: input.contentType,
      }),
    );

    return this.getPublicUrl(input.key);
  }

  async deleteObject(key: string) {
    await this.client.send(
      new DeleteObjectCommand({
        Bucket: this.config.bucketName,
        Key: key,
      }),
    );
  }

  getPublicUrl(key: string) {
    return `${this.config.publicBaseUrl.replace(/\/$/, '')}/${key}`;
  }

  isManagedUrl(url: string) {
    return url.startsWith(this.config.publicBaseUrl.replace(/\/$/, ''));
  }

  extractKey(url: string) {
    if (!this.isManagedUrl(url)) {
      return null;
    }

    return url.replace(`${this.config.publicBaseUrl.replace(/\/$/, '')}/`, '');
  }
}
