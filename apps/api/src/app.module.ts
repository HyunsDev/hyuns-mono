import { Module } from '@nestjs/common';

import { AuthModule } from './modules/auth/auth.module';
import { MeModule } from './modules/me/me.module';
import { CoreModule } from './core/core.module';

@Module({
  imports: [CoreModule, AuthModule, MeModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
