import { Global, Module } from '@nestjs/common';

import {
  ConfigModule,
  PrismaModule,
  CacheModule,
  httpConfig,
  prismaConfig,
  redisConfig,
  ssmConfig,
  ContextModule,
  mailerConfig,
  RedisModule,
} from '@workspace/backend-core';

import { discordWebhookConfig } from './configs';
import { googleOAuthConfig } from './configs';
import { publicAssetConfig } from './configs';
import { refreshTokenConfig } from './configs/refresh-token.config';
import { ExceptionFilterModule } from './exception-filter/exception-filter.module';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      extraLoad: [
        httpConfig,
        prismaConfig,
        redisConfig,
        ssmConfig,
        mailerConfig,

        refreshTokenConfig,
        googleOAuthConfig,
        publicAssetConfig,
        discordWebhookConfig,
      ],
    }),
    ContextModule.forRoot({
      enableDatabase: true,
      type: 'http',
    }),
    PrismaModule,
    RedisModule,
    CacheModule,
    ExceptionFilterModule,
  ],
  exports: [ContextModule, PrismaModule],
})
export class CoreModule {}
