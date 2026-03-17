interface ApiErrorBody {
  code?: string;
  details?: unknown;
  message?: string;
  status?: number;
}

interface ApiResponseShape {
  body: unknown;
  status: number;
}

export class ApiClientError extends Error {
  code?: string;
  details?: unknown;
  status: number;

  constructor({
    status,
    message,
    code,
    details,
  }: {
    status: number;
    message: string;
    code?: string;
    details?: unknown;
  }) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

const isSuccessStatus = (status: number) => status >= 200 && status < 300;

export const toApiClientError = (
  response: ApiResponseShape,
  fallbackMessage = '요청을 처리하지 못했습니다.',
) => {
  const body = (response.body ?? {}) as ApiErrorBody;

  return new ApiClientError({
    status: response.status,
    code: body.code,
    details: body.details,
    message: body.message ?? fallbackMessage,
  });
};

export const unwrapApiData = <T>(
  response: ApiResponseShape,
  fallbackMessage?: string,
) => {
  if (isSuccessStatus(response.status)) {
    return (response.body as { data: T }).data;
  }

  throw toApiClientError(response, fallbackMessage);
};

export const ensureApiSuccess = (
  response: ApiResponseShape,
  fallbackMessage?: string,
) => {
  if (!isSuccessStatus(response.status)) {
    throw toApiClientError(response, fallbackMessage);
  }

  return response;
};

export const getErrorMessage = (
  error: unknown,
  fallbackMessage = '알 수 없는 오류가 발생했습니다.',
) => {
  if (error instanceof ApiClientError) {
    return error.message;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallbackMessage;
};

export const isAuthError = (error: unknown) =>
  error instanceof ApiClientError && (error.status === 401 || error.status === 403);
