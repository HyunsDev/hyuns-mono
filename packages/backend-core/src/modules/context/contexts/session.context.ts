import { Injectable } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';

import { SessionData } from '@workspace/contract';

import { AppStore } from '../context.types';

@Injectable()
export class SessionContext {
  constructor(private readonly cls: ClsService<AppStore>) {}

  get session() {
    return this.cls.get('session');
  }

  get userId() {
    return this.session?.userId;
  }

  setSession(session: SessionData) {
    this.cls.set('session', session);
  }
}
