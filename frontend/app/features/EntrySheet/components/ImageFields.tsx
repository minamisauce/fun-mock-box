import { ImageUp } from 'lucide-react';
import type { RefObject } from 'react';
import { ImagePreviewCard } from '~/features/EntrySheet/components/ImagePreviewCard';
import { cn } from '~/lib/cn';

type Props = {
  preview: string | null;
  fileName: string | null;
  error: string | null;
  isExtracting: boolean;
  fileInputRef: RefObject<HTMLInputElement | null>;
  onSelectFile: () => void;
  onFileChange: (file: File) => void;
  onRemove: () => void;
};

/**
 * 「画像で文章取り込み」タブの取り込み領域。
 *
 * Figma: 新しいESを作成_画像で文章取り込み_01 / _02 (node 3302:4050 / 3302:4065)
 * - 未選択: 破線の枠そのものが取り込みボタン
 * - 選択後: 枠の下にファイルカード（サムネイル + ファイル名 + 状態 + 削除）
 *
 * 破線の矩形は「ここをタップして選ぶ」に見えるので、枠自体を button にしている。
 * 以前は枠の中に「ファイル選択」「カメラで撮影」の小さいボタンを2つ置いていたが、
 * 破線とボタンの枠線が入れ子になって線が多く、的も小さかった。
 *
 * ⚠ input に `capture` を付けないこと。付けるとカメラに直行してしまう。
 *   `accept='image/*'` だけなら、モバイルではタップした時点で OS が
 *   「写真を撮る / フォトライブラリ / ファイルを選択」を出してくれるので、
 *   カメラ用の input を別に持つ必要がない（PC では通常のファイルダイアログ）。
 *
 * 抽出後にどのステップへ進むかは呼び出し側（createSteps / reviewSteps）が決める。
 * このコンポーネントは「画像を選んで読み取るまで」に責務を絞っている。
 */
export function ImageFields({
  preview,
  fileName,
  error,
  isExtracting,
  fileInputRef,
  onSelectFile,
  onFileChange,
  onRemove,
}: Props) {
  return (
    <div className='flex flex-col gap-md'>
      <button
        type='button'
        onClick={onSelectFile}
        disabled={isExtracting}
        className={cn(
          'flex w-full flex-col items-center gap-xs rounded-md border-2 border-dashed border-border-1 p-xl transition-colors',
          isExtracting
            ? 'cursor-not-allowed opacity-30'
            : 'hover:border-primary hover:bg-primary-soft',
        )}
      >
        <ImageUp size={32} aria-hidden className='text-primary' />
        <span className='text-sm font-bold leading-md'>画像をアップロード</span>
        {/* 固定の改行（<br>）は入れない。枠幅が変われば折り返し位置も変わるため。
            2行に回ったときに末尾が1語だけ落ちないよう text-balance を効かせる */}
        <span className='text-balance text-center text-xs leading-md text-font-gray'>
          手書きのメモや画像からテキストを抽出します
        </span>
      </button>

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

      <ImagePreviewCard
        preview={preview}
        fileName={fileName}
        isExtracting={isExtracting}
        onRemove={onRemove}
      />

      {error && <p className='text-center text-xs text-danger'>{error}</p>}
    </div>
  );
}
