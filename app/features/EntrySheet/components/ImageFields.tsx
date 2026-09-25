import { Camera, Folder, X } from "lucide-react";
import type { RefObject } from "react";
import { Button } from "~/components/Button";
import { cn } from "~/lib/cn";
import { TOOL_THEME } from "~/lib/toolTheme";

const theme = TOOL_THEME["entry-sheet"];

type Props = {
  preview: string | null;
  fileName: string | null;
  error: string | null;
  isExtracting: boolean;
  fileInputRef: RefObject<HTMLInputElement | null>;
  cameraInputRef: RefObject<HTMLInputElement | null>;
  onSelectFile: () => void;
  onCaptureCamera: () => void;
  onFileChange: (file: File) => void;
  onRemove: () => void;
  /** 画像取り込み自体をやめて閉じる */
  onClose: () => void;
  /** 読み取れた項目名（例: 設問 / 企業名 / 本文）。未抽出なら空配列 */
  readFields: string[];
};

/**
 * 画像を選んでテキストを抽出する領域。
 * 出典: shukatsu-box/frontend/app/src/features/EntrySheet/components/ImageFields.tsx
 */
export function ImageFields({
  preview,
  fileName,
  error,
  isExtracting,
  fileInputRef,
  cameraInputRef,
  onSelectFile,
  onCaptureCamera,
  onFileChange,
  onRemove,
  onClose,
  readFields,
}: Props) {
  return (
    <section className="flex flex-col gap-sm rounded-md border-2 border-dashed border-border-1 p-lg">
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold leading-md">
          ESの画像から一括入力
        </span>
        <button
          type="button"
          onClick={onClose}
          disabled={isExtracting}
          className="text-xs text-light-blue hover:opacity-60 disabled:opacity-30"
        >
          閉じる
        </button>
      </div>

      <p className="text-center text-sm leading-md text-font-gray">
        手書きのメモやES画像を
        <br />
        アップロードすると、
        <br />
        自動でテキストを抽出します。
      </p>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFileChange(file);
        }}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFileChange(file);
        }}
      />

      <div className="flex justify-center gap-xs">
        <Button
          text="ファイル選択"
          variant="outline"
          size="sm"
          theme={theme}
          fullWidth={false}
          beforeIcon={<Folder size={16} aria-hidden />}
          onClick={onSelectFile}
          disabled={isExtracting}
        />
        <Button
          text="カメラで撮影"
          variant="outline"
          size="sm"
          theme={theme}
          fullWidth={false}
          beforeIcon={<Camera size={16} aria-hidden />}
          onClick={onCaptureCamera}
          disabled={isExtracting}
        />
      </div>

      {preview && (
        <div className="flex flex-col gap-xs">
          <div className="relative">
            <img
              src={preview}
              alt="アップロードした画像のプレビュー"
              className="max-h-60 w-full rounded-md border border-border-2 object-contain"
            />
            <button
              type="button"
              onClick={onRemove}
              aria-label="画像を削除"
              disabled={isExtracting}
              className="absolute right-xs top-xs flex size-6 items-center justify-center rounded-infinity bg-black text-white hover:opacity-60 disabled:opacity-30"
            >
              <X size={14} aria-hidden />
            </button>
          </div>
          {fileName && (
            <span className="truncate text-xs text-font-gray">{fileName}</span>
          )}
        </div>
      )}

      {isExtracting && (
        <div className="flex items-center justify-center gap-xs">
          <span
            aria-hidden
            className="size-4 animate-spin rounded-infinity border-2 border-primary-entry-sheet border-t-transparent"
          />
          <span className="text-xs text-font-gray">
            テキストを読み取っています…
          </span>
        </div>
      )}

      {readFields.length > 0 && !isExtracting && (
        <p className={cn("text-center text-xs leading-md", theme.text)}>
          読み取った項目: {readFields.join("・")}
          <br />
          <span className="text-font-gray">
            内容が正しいか、各項目を確認してください。
          </span>
        </p>
      )}

      {error && (
        <p className="text-center text-xs text-primary-red">{error}</p>
      )}
    </section>
  );
}
