import z from 'zod';

export const FILE_STATUS = {
  PENDING: 'pending',
  ACTIVE: 'active',
  FAILED: 'failed',
  DELETED: 'deleted',
  ORPHANED: 'orphaned',
} as const;
export const FileStatus = z.enum(FILE_STATUS);
export type FileStatus = z.infer<typeof FileStatus>;

export const FILE_ACCESS_TYPE = {
  PRIVATE: 'private',
  PUBLIC: 'public',
} as const;
export const FileAccessType = z.enum(FILE_ACCESS_TYPE);
export type FileAccessType = z.infer<typeof FileAccessType>;
