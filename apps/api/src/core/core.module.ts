import { Global, Module } from '@nestjs/common';
import { TsRestModule } from '@ts-rest/nest';

import {
  AccessControlModule,
  ContextModule,
  ConfigModule,
  httpConfig,
  LoggingModule,
  PrismaModule,
  prismaConfig,
  RedisModule,
  redisConfig,
  S3Module,
  s3Config,
  SessionModule,
  sessionConfig,
} from '@workspace/backend-core';

import { googleOAuthConfig } from './configs';
import { ExceptionFilterModule } from './exception-filter/exception-filter.module';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      extraLoad: [
        httpConfig,
        prismaConfig,
        redisConfig,
        sessionConfig,
        s3Config,
        googleOAuthConfig,
      ],
    }),
    TsRestModule.register({
      validateResponses: true,
    }),
    ContextModule.forRoot({
      enableDatabase: true,
      type: 'http',
    }),
    LoggingModule,
    PrismaModule,
    RedisModule,
    SessionModule,
    AccessControlModule,
    S3Module,
    ExceptionFilterModule,
  ],
  exports: [ContextModule, PrismaModule, SessionModule, S3Module],
})
export class CoreModule {}
