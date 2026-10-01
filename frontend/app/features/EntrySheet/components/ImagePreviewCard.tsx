import { X } from 'lucide-react';

type Props = {
  preview: string | null;
  fileName: string | null;
  /** 読み取り中。状態行を出し、削除させない */
  isExtracting?: boolean;
  onRemove: () => void;
};

/**
 * 選んだ画像のサムネイルとファイル名。
 *
 * 選択直後（読み取り中）と、読み取り結果の確認中の両方で使う。
 * 確認画面にも出すのは、直している内容がどの画像から来たのかを
 * 見失わないようにするため。
 *
 * 画像が無ければ何も描かないので、呼び出し側で出し分けなくてよい。
 */
export function ImagePreviewCard({
  preview,
  fileName,
  isExtracting = false,
  onRemove,
}: Props) {
  if (!preview) return null;

  return (
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
              className='size-3 animate-spin rounded-infinity border-2 border-primary border-t-transparent'
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
  );
}
