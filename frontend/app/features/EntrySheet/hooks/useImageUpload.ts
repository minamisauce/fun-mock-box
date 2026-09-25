import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ENTRY_SHEETS_IMAGE_ERRORS,
  ENTRY_SHEETS_MAX_IMAGE_SIZE,
} from '~/features/EntrySheet/constants';
import { extractEntrySheetFromImage } from '~/mocks/entrySheet';
import type { ExtractedEntrySheet } from '~/types/entrySheet';

/**
 * 画像を選んでテキストを抽出するまでの状態をまとめて扱う。
 * 出典: shukatsu-box/frontend/app/src/features/EntrySheet/hooks/useImageUpload.ts
 * （本番は S3 アップロードを挟むが、モックでは抽出のみ）
 */
export function useImageUpload({
  onExtracted,
}: {
  onExtracted: (result: ExtractedEntrySheet) => void;
}) {
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // createObjectURL は明示的に解放しないとリークする
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const clearInputs = useCallback(() => {
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  }, []);

  const removeImage = useCallback(() => {
    setPreview((current) => {
      if (current) URL.revokeObjectURL(current);
      return null;
    });
    setFileName(null);
    setError(null);
    setIsExtracting(false);
    clearInputs();
  }, [clearInputs]);

  const selectFile = () => {
    setError(null);
    fileInputRef.current?.click();
  };

  const captureCamera = () => {
    setError(null);
    cameraInputRef.current?.click();
  };

  const handleFile = useCallback(
    async (file: File) => {
      setError(null);

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
        const result = await extractEntrySheetFromImage(file);
        onExtracted(result);
      } catch (e) {
        console.error(e);
        setError(ENTRY_SHEETS_IMAGE_ERRORS.extractFailed);
      } finally {
        setIsExtracting(false);
      }
    },
    [onExtracted, clearInputs],
  );

  return {
    preview,
    fileName,
    error,
    isExtracting,
    fileInputRef,
    cameraInputRef,
    selectFile,
    captureCamera,
    handleFile,
    removeImage,
  };
}
