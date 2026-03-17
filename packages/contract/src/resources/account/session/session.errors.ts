import { defineApiErrors } from '@/internal';

export const SessionApiErrors = defineApiErrors({
  SessionNotFound: {
    status: 404,
    code: 'SESSION_NOT_FOUND',
    message: '세션을 찾을 수 없습니다',
  },
  CurrentSessionCannotBeDeleted: {
    status: 400,
    code: 'CURRENT_SESSION_CANNOT_BE_DELETED',
    message: '현재 세션은 삭제할 수 없습니다',
  },
  SessionClosed: {
    status: 403,
    code: 'SESSION_CLOSED',
    message: '세션이 이미 종료되었습니다',
  },
  SessionExpired: {
    status: 403,
    code: 'SESSION_EXPIRED',
    message: '세션이 만료되었습니다',
  },
  SessionRevoked: {
    status: 403,
    code: 'SESSION_REVOKED',
    message: '세션이 해지되었습니다',
  },
});
