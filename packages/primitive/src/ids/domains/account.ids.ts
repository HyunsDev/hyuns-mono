import z from 'zod';

import { brandedUuidSchema, type BrandId } from '@/utils/brand.type';

export type EmailVerificationCode = BrandId<string, 'EmailVerificationCode'>;
export const asEmailVerificationCode = (value: string): EmailVerificationCode =>
  value as EmailVerificationCode;
export const EmailVerificationCodeSchema = z
  .string()
  .length(6)
  .transform((val) => val as EmailVerificationCode);

export type PasswordResetCode = BrandId<string, 'PasswordResetCode'>;
export const asPasswordResetCode = (value: string): PasswordResetCode => value as PasswordResetCode;
export const PasswordResetCodeSchema = brandedUuidSchema<PasswordResetCode>();

export type RefreshTokenId = BrandId<string, 'RefreshTokenId'>;
export const asRefreshTokenId = (value: string): RefreshTokenId => value as RefreshTokenId;
export const RefreshTokenIdSchema = brandedUuidSchema<RefreshTokenId>();

export type SessionId = BrandId<string, 'SessionId'>;
export const asSessionId = (value: string): SessionId => value as SessionId;
export const SessionIdSchema = brandedUuidSchema<SessionId>();

export type NotificationId = BrandId<string, 'NotificationId'>;
export const asNotificationId = (value: string): NotificationId => value as NotificationId;
export const NotificationIdSchema = brandedUuidSchema<NotificationId>();

export type InboxItemId = BrandId<string, 'InboxItemId'>;
export const asInboxItemId = (value: string): InboxItemId => value as InboxItemId;
export const InboxItemIdSchema = brandedUuidSchema<InboxItemId>();

export type AccountIdUnion =
  | EmailVerificationCode
  | PasswordResetCode
  | RefreshTokenId
  | SessionId
  | NotificationId
  | InboxItemId;
