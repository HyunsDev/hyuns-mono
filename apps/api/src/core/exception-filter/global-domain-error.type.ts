import { EnsurePublic, AccessDeniedError } from '@workspace/backend-core';

export type GlobalDomainError = EnsurePublic<AccessDeniedError>;
