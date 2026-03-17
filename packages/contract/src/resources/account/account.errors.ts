import { uniqueDeepMerge } from '@workspace/shared';

import { PersonalAccessTokenApiErrors } from './personal-access-token';
import { SessionApiErrors } from './session';
import { UserApiErrors } from './user';

export const AccountApiErrors = uniqueDeepMerge(
  SessionApiErrors,
  UserApiErrors,
  PersonalAccessTokenApiErrors,
);
