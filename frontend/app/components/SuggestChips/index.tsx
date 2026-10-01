import { RefreshCw } from 'lucide-react';
import { useCallback, useState } from 'react';
import { cn } from '~/lib/cn';

type Props = {
  /** 候補ワードの母集団 */
  candidates: readonly string[];
  /** 一度に表示する数 */
  maxCount?: number;
  onPick: (word: string) => void;
  className?: string;
};

function pickRandom(candidates: readonly string[], count: number): string[] {
  // 全部出し切るなら並べ替える意味が無いので定義順のまま出す
  if (candidates.length <= count) {
    return [...candidates];
  }

  const shuffled = [...candidates];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, count);
}

/** 記入候補のチップ。タップで入力欄に差し込み、「他のワード」で引き直す */
export function SuggestChips({
  candidates,
  maxCount = 6,
  onPick,
  className,
}: Props) {
  // 初期値も1回だけ評価する（毎レンダーでシャッフルされないように）
  const [words, setWords] = useState(() => pickRandom(candidates, maxCount));

  const shuffle = useCallback(() => {
    setWords(pickRandom(candidates, maxCount));
  }, [candidates, maxCount]);

  // 候補が表示数以下なら引き直す先が無いので「他のワード」を出さない
  const canShuffle = candidates.length > maxCount;

  return (
    <div className={cn('flex flex-col gap-xs', className)}>
      <div className='flex items-center justify-between'>
        <span className='text-xs text-font-gray'>記入候補</span>
        {canShuffle && (
          <button
            type='button'
            onClick={shuffle}
            // textarea の blur によるレイアウトシフトで click が不発になるのを防ぐ
            onMouseDown={(e) => e.preventDefault()}
            className='inline-flex items-center gap-3xs text-xs text-light-blue hover:opacity-60'
          >
            <RefreshCw size={12} aria-hidden />
            他のワード
          </button>
        )}
      </div>
      <div className='flex flex-wrap gap-xs'>
        {words.map((word) => (
          <button
            key={word}
            type='button'
            onClick={() => onPick(word)}
            onMouseDown={(e) => e.preventDefault()}
            // Design System: display/tag (node 3024:1564)
            // default = 白地 + border-2 + 12px font-gray、押下で selected = gray-2 + black
            className='rounded-infinity border border-border-2 px-md py-sm text-xs text-font-gray transition-colors hover:bg-gray-2 hover:text-black'
          >
            {word}
          </button>
        ))}
      </div>
    </div>
  );
}
