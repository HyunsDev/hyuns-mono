import { Injectable } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';

import { AccessTokenPayload } from '@workspace/primitive';

import { AppStore } from '../context.types';

@Injectable()
export class TokenContext {
  constructor(private readonly cls: ClsService<AppStore>) {}

  get token() {
    return this.cls.get('token');
  }

  get userId() {
    return this.token?.sub;
  }

  setToken(token: AccessTokenPayload) {
    this.cls.set('token', token);
  }
}
