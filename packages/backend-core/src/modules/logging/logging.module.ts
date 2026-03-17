import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { LoggerModule as NestjsPinoLoggerModule } from 'nestjs-pino';

import { CoreConfig, coreConfig } from '@/modules/config';

@Module({
  imports: [
    NestConfigModule,
    NestjsPinoLoggerModule.forRootAsync({
      imports: [NestConfigModule],
      inject: [coreConfig.KEY],
      useFactory: async (config: CoreConfig) => {
        return {
          pinoHttp: {
            level: config.isProduction ? 'info' : 'debug',
            transport: config.isProduction
              ? undefined
              : {
                  target: 'pino-pretty',
                  options: {
                    colorize: true,
                    singleLine: true,
                    translateTime: 'SYS:HH:MM:ss',
                  },
                },
            autoLogging: true,
            serializers: {
              req: (req: { id?: string; method?: string; url?: string }) => ({
                id: req.id,
                method: req.method,
                url: req.url,
              }),
            },
          },
        };
      },
    }),
  ],
  exports: [NestjsPinoLoggerModule],
})
export class LoggingModule {}
