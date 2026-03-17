import { initClient } from '@ts-rest/core';

import { contract } from '@workspace/contract';

const FALLBACK_API_BASE_URL = 'http://localhost:3000';

type ApiResult = Promise<{
  body: unknown;
  headers: Headers;
  status: number;
}>;

export interface AuthWebApiClient {
  auth: {
    logout: () => ApiResult;
    oauth: {
      googleCallback: (args: { body: { idToken: string } }) => ApiResult;
      start: (args: { body: { provider: 'google'; redirectUrl: string } }) => ApiResult;
    };
  };
  me: {
    get: () => ApiResult;
    sessions: {
      delete: (args: { params: { sessionId: string } }) => ApiResult;
      list: () => ApiResult;
    };
    updateAvatar: (args: { body: { file: File } }) => ApiResult;
    updateProfile: (args: { body: { name?: string } }) => ApiResult;
  };
}

export const getApiBaseUrl = () => {
  const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();

  return configuredBaseUrl && configuredBaseUrl.length > 0
    ? configuredBaseUrl
    : FALLBACK_API_BASE_URL;
};

export const createApiClient = (baseUrl = getApiBaseUrl()) =>
  initClient(contract as never, {
    baseUrl,
    credentials: 'include',
    jsonQuery: true,
    validateResponse: true,
  }) as unknown as AuthWebApiClient;

export const apiClient = createApiClient();

export type ApiClient = ReturnType<typeof createApiClient>;
