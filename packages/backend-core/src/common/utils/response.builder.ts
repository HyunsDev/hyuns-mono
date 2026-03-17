import { ApiError, OkResult } from '@workspace/shared';

export const apiOk = <const S extends number, const B extends OkResult>(status: S, body: B) => {
  return { status, body } as const;
};

export const apiErr = <const B extends ApiError, const Details>(apiError: B, details?: Details) => {
  return {
    status: apiError.status as B['status'],
    body: {
      ...apiError,
      details,
    },
  } as const;
};
