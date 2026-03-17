import { Module } from '@nestjs/common';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { GoogleIdTokenService } from './google-id-token.service';

@Module({
  controllers: [AuthController],
  providers: [AuthService, GoogleIdTokenService],
})
export class AuthModule {}
