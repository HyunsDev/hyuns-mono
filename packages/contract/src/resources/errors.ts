import { uniqueDeepMerge } from '@workspace/shared';

import { AccountApiErrors } from './account';
import { CommonApiErrors } from './common.errors';

export const ApiErrors = uniqueDeepMerge(CommonApiErrors, AccountApiErrors);
export const ApiErrorCodes = Object.keys(ApiErrors) as (keyof typeof ApiErrors)[];
export type ApiErrorCode = (typeof ApiErrorCodes)[number];
