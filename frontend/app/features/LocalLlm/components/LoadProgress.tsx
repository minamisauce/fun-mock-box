import {
  findModel,
  formatMB,
  type LlmModelId,
} from '~/features/LocalLlm/constants';

type Props = {
  modelId: LlmModelId;
  /** 0〜1 */
  progress: number;
  /** WebLLM が返す進捗の文言（英語）。開発者向けに小さく出す */
  detail: string;
};

/**
 * モデルの読み込み。初回は数百MB〜1GB超のダウンロードになるので、
 * 何がどこまで進んだかを数字で見せる。
 *
 * ステップ用の ProgressBar（残りN問）とは意味が違うので別に持つ。見た目は揃える。
 */
export function LoadProgress({ modelId, progress, detail }: Props) {
  const model = findModel(modelId);
  const percent = Math.round(Math.min(Math.max(progress, 0), 1) * 100);

  return (
    <div className='flex flex-col gap-sm rounded-md bg-gray-1 p-md'>
      <div className='flex items-baseline justify-between gap-xs'>
        <p className='text-sm font-bold text-black'>モデルを読み込んでいます</p>
        <span className='text-lg font-bold tabular-nums text-primary'>
          {percent}%
        </span>
      </div>

      <div
        className='relative h-1 w-full'
        role='progressbar'
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        aria-label='モデルの読み込み'
      >
        <div className='absolute inset-0 rounded-infinity bg-gray-3' />
        <div
          className='absolute inset-y-0 left-0 rounded-infinity bg-primary transition-[width] duration-300'
          style={{ width: `${percent}%` }}
        />
      </div>

      <p className='text-xs leading-md text-black'>
        初回だけ {model.label}（{formatMB(model.downloadMB)}
        ）をダウンロードします。2回目からは端末に保存したものを使うので、すぐに始まります。
      </p>
      {detail && (
        <p className='line-clamp-2 break-all text-xxs text-font-gray'>
          {detail}
        </p>
      )}
    </div>
  );
}
