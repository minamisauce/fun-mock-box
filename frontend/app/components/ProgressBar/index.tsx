import { cn } from '~/lib/cn';

/**
 * Design System: Components / display/progressBar (node 3024:1577)
 *
 * 丸数字ではなく、4px の細いバー + 右側に「残りN問」。
 * - base:   #e9e9e9 (gray-3)、rounded-infinity
 * - active: primary（= 居るツールの色）、rounded-infinity
 * - label:  12px / font-gray
 */

type Props = {
  /** 0 始まりの現在ステップ */
  current: number;
  total: number;
  className?: string;
};

export function ProgressBar({ current, total, className }: Props) {
  const answered = Math.min(Math.max(current + 1, 0), total);
  // 分母は total ではなく total + 1（就活BOX の ProgressBar と同じ）。
  // 表示中の問題は未回答なので、1問目で 0% に見えず、
  // 最終問（残り1問）でバーが埋まりきらないようにするため。
  const percent = (answered / (total + 1)) * 100;
  // status=1 のとき「残り7問（全7問）」なので、残数は total - current
  const remaining = Math.max(total - current, 0);

  return (
    <div
      className={cn('flex w-full items-center gap-[10px]', className)}
      role='progressbar'
      aria-valuemin={0}
      aria-valuemax={total + 1}
      aria-valuenow={answered}
      aria-valuetext={`ステップ ${answered} / ${total}`}
    >
      <div className='relative h-1 min-w-px flex-1'>
        <div className='absolute inset-0 rounded-infinity bg-gray-3' />
        <div
          className='absolute inset-y-0 left-0 rounded-infinity bg-primary transition-[width] duration-300'
          style={{ width: `${percent}%` }}
        />
      </div>
      <span className='shrink-0 text-center text-xs text-font-gray'>
        残り{remaining}問
      </span>
    </div>
  );
}
