import { useCallback, useEffect, useRef, useState } from 'react';
import { dataClient } from '~/data';
import { reportError } from '~/data/errors';
import {
  ENTRY_SHEETS_IMAGE_ERRORS,
  ENTRY_SHEETS_MAX_IMAGE_SIZE,
} from '~/features/EntrySheet/constants';
import { GENERATING_MIN_DURATION_MS, withMinimumDuration } from '~/lib/delay';
import type { ExtractedEntrySheet } from '~/types/entrySheet';

/**
 * 画像を選んでテキストを抽出するまでの状態をまとめて扱う。
 * 出典: shukatsu-box/frontend/app/src/features/EntrySheet/hooks/useImageUpload.ts
 * （本番は S3 アップロードを挟むが、モックでは抽出のみ）
 *
 * 読み取り結果は `extracted` に置くだけで、次に何をするかは呼び出し側が決める。
 * 以前は onExtracted コールバックで即座に画面遷移していたが、読み取った内容を
 * 確認してから進めるようにしたため、結果を保持する形にしている。
 */
export function useImageUpload() {
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extracted, setExtracted] = useState<ExtractedEntrySheet | null>(null);

  // input は1つだけ。`capture` 付きのカメラ用は持たない
  // （理由は ImageFields の JSDoc を参照）
  const fileInputRef = useRef<HTMLInputElement>(null);

  // createObjectURL は明示的に解放しないとリークする
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  // 同じファイルを選び直しても change が飛ぶよう、値を空に戻す
  const clearInputs = useCallback(() => {
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  const removeImage = useCallback(() => {
    setPreview((current) => {
      if (current) URL.revokeObjectURL(current);
      return null;
    });
    setFileName(null);
    setError(null);
    setIsExtracting(false);
    setExtracted(null);
    clearInputs();
  }, [clearInputs]);

  const selectFile = () => {
    setError(null);
    fileInputRef.current?.click();
  };

  const handleFile = useCallback(
    async (file: File) => {
      setError(null);
      setExtracted(null);

      if (!file.type.startsWith('image/')) {
        setError(ENTRY_SHEETS_IMAGE_ERRORS.notImage);
        clearInputs();
        return;
      }
      if (file.size > ENTRY_SHEETS_MAX_IMAGE_SIZE) {
        setError(ENTRY_SHEETS_IMAGE_ERRORS.tooLarge);
        clearInputs();
        return;
      }

      setPreview((current) => {
        if (current) URL.revokeObjectURL(current);
        return URL.createObjectURL(file);
      });
      setFileName(file.name);
      setIsExtracting(true);

      try {
        // データ層は即座に解決するので、ここで最低表示時間を確保する。
        // 入れないとオーバーレイが点滅して読み取ったように見えない
        const result = await withMinimumDuration(
          dataClient.entrySheets.extractFromImage(file),
          GENERATING_MIN_DURATION_MS,
        );
        setExtracted(result);
      } catch (e) {
        reportError(e);
        // サーバーの汎用文言より「別の画像をお試しください」の方が
        // 次の行動が分かるので、ここは固定文言のままにする
        setError(ENTRY_SHEETS_IMAGE_ERRORS.extractFailed);
      } finally {
        setIsExtracting(false);
      }
    },
    [clearInputs],
  );

  return {
    preview,
    fileName,
    error,
    isExtracting,
    extracted,
    fileInputRef,
    selectFile,
    handleFile,
    removeImage,
  };
}
