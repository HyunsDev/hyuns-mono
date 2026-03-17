import { ClsStore } from 'nestjs-cls';

import { SessionData } from '@workspace/contract';
import { Prisma } from '@workspace/database';

export interface CoreStore {
  requestId: string;
  errorCode?: string;
}

export interface SessionStore {
  session?: SessionData;
}

export interface ClientStore {
  client?: {
    ipAddress: string;
    userAgent: string;
  };
}

export interface TransactionStore {
  transaction?: Prisma.TransactionClient;
}

export type AppStore = ClsStore & CoreStore & ClientStore & TransactionStore & SessionStore;
