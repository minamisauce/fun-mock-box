import * as z from 'zod';

/**
 * 共通エラー形。就活BOX（api-schema/src/common/error-response.ts）と
 * フィールド名を完全に揃えてある。
 *
 * user_message はそのまま画面に出せる日本語を入れる。
 */
export const errorDetail = z.object({
  /** 該当フィールド。全体に対するエラーなら 'base' */
  field: z.string(),
  /** 開発者向け */
  message: z.string(),
  /** 画面に出す日本語 */
  user_message: z.string(),
});
export type ErrorDetail = z.infer<typeof errorDetail>;

export const errorResponse = z.object({
  status: z.string(),
  error_details: z.array(errorDetail),
});
export type ErrorResponse = z.infer<typeof errorResponse>;
