import type { ErrorDetail, ErrorResponse } from '@fun/api-schema';

/** 返しうるエラーステータス。増やすときはここに足す */
export type ErrorStatus = 400 | 404 | 500;

/**
 * 意図的に返すエラー。app.ts の onError が status と body をそのまま返す。
 * body の形は就活BOXと同じ `{ status, error_details: [...] }`。
 */
export class AppError extends Error {
  readonly status: ErrorStatus;
  readonly body: ErrorResponse;

  constructor(status: ErrorStatus, body: ErrorResponse) {
    super(`${status} ${body.status}`);
    this.name = 'AppError';
    this.status = status;
    this.body = body;
  }
}

export function errorBody(
  status: string,
  userMessage: string,
  field = 'base',
): ErrorResponse {
  return {
    status,
    error_details: [{ field, message: status, user_message: userMessage }],
  };
}

export function badRequest(details: ErrorDetail[]): AppError {
  return new AppError(400, { status: 'bad_request', error_details: details });
}

export function notFound(
  userMessage = '対象のデータが見つかりませんでした。',
): AppError {
  return new AppError(404, errorBody('not_found', userMessage));
}

export function internalServerErrorBody(): ErrorResponse {
  return errorBody(
    'internal_server_error',
    '時間をおいて再度お試しください。',
  );
}
