/**
 * データアクセス層が投げる唯一のエラー型。
 *
 * localStorage 実装も HTTP 実装も同じ型を投げるので、UI 側は
 * 実装の違いを意識せず `error.userMessage` を出すだけでよい。
 */

/** サーバーの共通エラー形 `{ status, error_details: [...] }` の要素 */
export type ErrorDetail = {
  field: string;
  message: string;
  user_message: string;
};

export type DataErrorKind =
  | 'not_found'
  | 'validation'
  | 'network'
  | 'server'
  | 'unknown';

/** user_message がサーバーから来なかったときの既定文言 */
const DEFAULT_USER_MESSAGES: Record<DataErrorKind, string> = {
  not_found: '対象のデータが見つかりませんでした。',
  validation: '入力内容をご確認ください。',
  network: '通信に失敗しました。電波の良い場所で再度お試しください。',
  server: '時間をおいて再度お試しください。',
  unknown: '予期しないエラーが発生しました。',
};

type DataErrorOptions = {
  /** 開発者向け。画面には出さない */
  message?: string;
  status?: number;
  details?: ErrorDetail[];
  /** 画面にそのまま出せる日本語。省略時は kind の既定文言 */
  userMessage?: string;
};

export class DataError extends Error {
  readonly kind: DataErrorKind;
  readonly status: number | undefined;
  readonly details: ErrorDetail[] | undefined;
  /** 常に埋まっている。UI はこれを出すだけでよい */
  readonly userMessage: string;

  constructor(kind: DataErrorKind, options: DataErrorOptions = {}) {
    super(options.message ?? `DataError: ${kind}`);
    this.name = 'DataError';
    this.kind = kind;
    this.status = options.status;
    this.details = options.details;
    this.userMessage = options.userMessage ?? DEFAULT_USER_MESSAGES[kind];
  }
}

/**
 * 想定外のエラーを DataError に正規化する。
 * AbortError は「中断」であって失敗ではないので、ここには渡さないこと。
 */
export function toDataError(error: unknown): DataError {
  if (error instanceof DataError) return error;
  return new DataError('unknown', {
    message: error instanceof Error ? error.message : String(error),
  });
}

/**
 * ログ出力の集約点。将来 Sentry 等を入れるときはここだけ変える。
 * 呼び出し側に `console.error` を散らさない。
 */
export function reportError(error: unknown): void {
  console.error(error);
}
