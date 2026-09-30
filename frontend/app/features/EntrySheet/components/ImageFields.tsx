import { Camera, Folder, X } from 'lucide-react';
import type { RefObject } from 'react';
import { Button } from '~/components/Button';
import { TOOL_THEME } from '~/lib/toolTheme';

const theme = TOOL_THEME['entry-sheet'];

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
};

/**
 * 「画像で文章取り込み」タブの取り込み領域。
 *
 * Figma: 新しいESを作成_画像で文章取り込み_01 / _02 (node 3302:4050 / 3302:4065)
 * - 未選択: 破線の枠に説明文 + ファイル選択 / カメラで撮影
 * - 選択後: 枠の下にファイルカード（サムネイル + ファイル名 + 状態 + 削除）
 *
 * 抽出が終わったあとのフォーム表示は呼び出し側（EntrySheetForm）が持つ。
 * このコンポーネントは「画像を選んで読み取るまで」に責務を絞っている。
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
}: Props) {
  return (
    <div className='flex flex-col gap-md'>
      <section className='flex flex-col gap-md rounded-md border-2 border-dashed border-border-1 p-lg'>
        <p className='text-center text-sm leading-md text-font-gray'>
          手書きのメモやES画像を
          <br />
          アップロードすると、
          <br />
          自動でテキストを抽出します。
        </p>

        <input
          ref={fileInputRef}
          type='file'
          accept='image/*'
          className='hidden'
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onFileChange(file);
          }}
        />
        <input
          ref={cameraInputRef}
          type='file'
          accept='image/*'
          capture='environment'
          className='hidden'
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onFileChange(file);
          }}
        />

        <div className='flex justify-center gap-xs'>
          <Button
            text='ファイル選択'
            variant='outline'
            size='sm'
            theme={theme}
            fullWidth={false}
            beforeIcon={<Folder size={16} aria-hidden />}
            onClick={onSelectFile}
            disabled={isExtracting}
          />
          <Button
            text='カメラで撮影'
            variant='outline'
            size='sm'
            theme={theme}
            fullWidth={false}
            beforeIcon={<Camera size={16} aria-hidden />}
            onClick={onCaptureCamera}
            disabled={isExtracting}
          />
        </div>
      </section>

      {preview && (
        <div className='flex items-center gap-sm rounded-md border border-border-2 bg-white p-sm'>
          <img
            src={preview}
            alt='アップロードした画像のプレビュー'
            className='size-16 shrink-0 rounded-sm border border-border-2 object-cover'
          />
          <div className='flex min-w-px flex-1 flex-col gap-3xs'>
            <span className='truncate text-sm leading-md'>{fileName}</span>
            {isExtracting && (
              <span className='flex items-center gap-xs text-xs text-font-gray'>
                <span
                  aria-hidden
                  className='size-3 animate-spin rounded-infinity border-2 border-primary-entry-sheet border-t-transparent'
                />
                テキスト抽出中
              </span>
            )}
          </div>
          <button
            type='button'
            onClick={onRemove}
            aria-label='画像を削除'
            disabled={isExtracting}
            className='flex size-6 shrink-0 items-center justify-center text-font-gray hover:opacity-60 disabled:opacity-30'
          >
            <X size={16} aria-hidden />
          </button>
        </div>
      )}

      {error && <p className='text-center text-xs text-primary-red'>{error}</p>}
    </div>
  );
}
