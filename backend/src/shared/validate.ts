import type { Context } from 'hono';

/**
 * zValidator が渡してくる検証結果。
 * zod の $ZodError をそのまま書くと型が噛み合わないので、
 * 実際に使うプロパティだけを構造的に受ける。
 */
type ValidationIssue = {
  path: readonly PropertyKey[];
  code: string;
  message: string;
};

type ValidationResult =
  | { success: true }
  | { success: false; error: { issues: readonly ValidationIssue[] } };

/**
 * zValidator に渡す共通のエラーフック。
 * 検証エラーを就活BOXと同じ `{ status, error_details: [...] }` に整形する。
 *
 * zValidator 自体をラップすると Hono の型推論（c.req.valid）と噛み合わないので、
 * フックだけ共有して各ルートで `zValidator(target, schema, validationErrorHook)` と書く。
 */
export function validationErrorHook(result: ValidationResult, c: Context) {
  if (result.success) return;

  return c.json(
    {
      status: 'bad_request',
      error_details: result.error.issues.map((issue) => ({
        field: issue.path.map(String).join('.') || 'base',
        // zod の文言は英語なので開発者向けの message に置き、
        // 画面に出る user_message は日本語の汎用文言にする。
        // フロントは送信前に検証しているので、ここに来るのは通常バグか直叩き
        message: `${issue.code}: ${issue.message}`,
        user_message: '入力内容をご確認ください。',
      })),
    },
    400,
  );
}
