import { defineApiErrors } from '@/internal';

export const PersonalAccessTokenApiErrors = defineApiErrors({
  PersonalAccessTokenNotFound: {
    status: 404,
    code: 'PERSONAL_ACCESS_TOKEN_NOT_FOUND',
    message: '개인 액세스 토큰을 찾을 수 없습니다',
  },
  PersonalAccessTokenAlreadyRevoked: {
    status: 400,
    code: 'PERSONAL_ACCESS_TOKEN_ALREADY_REVOKED',
    message: '이미 폐기된 개인 액세스 토큰입니다',
  },
});
