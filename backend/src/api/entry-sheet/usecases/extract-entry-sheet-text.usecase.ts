import type { ExtractEntrySheetTextResponse } from '@fun/api-schema';
import { extractSample } from '@fun/api-schema/generators';
import { badRequest } from '../../../shared/errors';

/** 本番と同じ 10MB */
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

/**
 * 画像からの内容抽出。
 *
 * 本番は S3 へアップロードしてサーバー側で OCR している
 * （shukatsu-box backend/src/api/entry-sheet/services/extract-text-from-image.service.ts）。
 * ここでは画像のバイト列は読まず、ファイル名から決定論的にサンプルを返す。
 * 実 OCR に差し替えるときはこの関数の中身だけを変えればよい。
 */
export async function extractEntrySheetText(
  file: File,
): Promise<ExtractEntrySheetTextResponse> {
  if (!file.type.startsWith('image/')) {
    throw badRequest([
      {
        field: 'image',
        message: 'not_an_image',
        user_message: '画像ファイルを選択してください。',
      },
    ]);
  }
  if (file.size > MAX_IMAGE_SIZE) {
    throw badRequest([
      {
        field: 'image',
        message: 'too_large',
        user_message: '画像サイズは10MBまでです。',
      },
    ]);
  }

  return extractSample(file.name);
}
