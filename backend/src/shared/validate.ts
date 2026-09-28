import type { Context } from 'hono';
import type { ZodError } from 'zod';

/**
 * zValidator に渡す共通のエラーフック。
 * 検証エラーを就活BOXと同じ `{ status, error_details: [...] }` に整形する。
 *
 * zValidator 自体をラップすると Hono の型推論（c.req.valid）と噛み合わないので、
 * フックだけ共有して各ルートで `zValidator(target, schema, validationErrorHook)` と書く。
 */
export function validationErrorHook(
  result: { success: true } | { success: false; error: ZodError },
  c: Context,
) {
  if (result.success) return;

  return c.json(
    {
      status: 'bad_request',
      error_details: result.error.issues.map((issue) => ({
        field: issue.path.join('.') || 'base',
        message: issue.code,
        user_message: issue.message,
      })),
    },
    400,
  );
}
