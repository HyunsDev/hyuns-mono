import { v7 } from 'uuid';
import z from 'zod';

import { brandedUuidSchema, type BrandId } from '@/utils/brand.type';

// Account Domain IDs

export type UserId = BrandId<string, 'UserId'>;
export const newUserId = () => v7() as UserId;
export const asUserId = (value: string): UserId => value as UserId;
export const UserIdSchema = brandedUuidSchema<UserId>();

export type UserEmail = BrandId<string, 'UserEmail'>;
export const asUserEmail = (value: string): UserEmail => value as UserEmail;
export const UserEmailSchema = z.email().transform((val) => val as UserEmail);

// Infrastructure Domain IDs

export type FileId = BrandId<string, 'FileId'>;
export const newFileId = () => v7() as FileId;
export const asFileId = (value: string): FileId => value as FileId;
export const FileIdSchema = brandedUuidSchema<FileId>();

export type FileReferenceId = BrandId<string, 'FileReferenceId'>;
export const newFileReferenceId = () => v7() as FileReferenceId;
export const asFileReferenceId = (value: string): FileReferenceId => value as FileReferenceId;
export const FileReferenceIdSchema = brandedUuidSchema<FileReferenceId>();

// Change Id

export type ChangeId = BrandId<string, 'ChangeId'>;
export const newChangeId = () => v7() as ChangeId;
export const asChangeId = <T extends string>(id: T): ChangeId => id as unknown as ChangeId;
export const ChangeIdSchema = brandedUuidSchema<ChangeId>();

export type CoreIdUnion = UserId | UserEmail | FileId | FileReferenceId | ChangeId;
