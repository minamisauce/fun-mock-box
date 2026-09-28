import * as z from 'zod';

/**
 * パスパラメータの :id。
 * ここで弾くので、usecase 側は「形式が正しい id」だけを考えればよい。
 */
export const idParam = z.object({
  id: z.uuid(),
});
export type IdParam = z.infer<typeof idParam>;
