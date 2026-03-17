import { SessionData } from '@workspace/contract';

export interface SessionRecord extends SessionData {
  name: string;
  os: string;
  device: string;
  userAgent: string;
}

export interface SessionCreationInput {
  userId: string;
  userRole: SessionData['userRole'];
  name: string;
  os: string;
  device: string;
  userAgent: string;
}
