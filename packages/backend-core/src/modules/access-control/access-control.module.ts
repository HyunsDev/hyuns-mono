import { Global, Module, Provider } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';

import { RolesGuard, SessionGuard } from './guards';

const guardProviders: Provider[] = [
  {
    provide: APP_GUARD,
    useClass: SessionGuard,
  },
  {
    provide: APP_GUARD,
    useClass: RolesGuard,
  },
];

@Global()
@Module({
  providers: [...guardProviders],
})
export class AccessControlModule {}
