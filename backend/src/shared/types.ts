/**
 * Hono の Variables。
 * userId を必須にしておくと、usecase を呼ぶときに取り忘れると型エラーになる。
 */
export type AppEnv = {
  Variables: {
    userId: string;
  };
};
