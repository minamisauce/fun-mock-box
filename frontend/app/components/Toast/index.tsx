import { AnimatePresence, motion } from 'framer-motion';
import { useEffect } from 'react';
import { cn } from '~/lib/cn';

/**
 * Design System: Components / toast (node 135:388)
 *
 * - 幅 343px（375px の画面で左右 16px を空けた幅）、角丸 4px、p 12px
 * - 枠線・文字が同色で、背景はその淡色。文字は 12px の W3（太字にしない）
 * - status で色だけが変わる。warning がブランド色なのは DS の指定どおり
 *
 * 画面下に固定し、一定時間で自動的に消える。操作を邪魔しないよう
 * 外側は pointer-events-none にしてある。
 */

export type ToastStatus = 'success' | 'warning' | 'info' | 'error';

const STATUS_CLASS: Record<ToastStatus, string> = {
  success: 'border-success bg-success-soft text-success',
  warning: 'border-warning bg-warning-soft text-warning',
  info: 'border-info bg-info-soft text-info',
  error: 'border-danger bg-danger-soft text-danger',
};

type Props = {
  /** null の間は出さない。文字列が変わるたびに表示時間を数え直す */
  message: string | null;
  status?: ToastStatus;
  onClose: () => void;
  /** 読み切れる程度の長さ。短くしすぎると消えたことに気付けない */
  durationMs?: number;
};

export function Toast({
  message,
  status = 'success',
  onClose,
  durationMs = 3000,
}: Props) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(onClose, durationMs);
    return () => clearTimeout(timer);
  }, [message, durationMs, onClose]);

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.2 }}
          // ツール画面にも BottomNav があるので、その上に浮かせる
          className='pointer-events-none fixed inset-x-0 bottom-bottom-nav z-50 flex justify-center pb-sm'
        >
          {/* ToolLayout と同じ 375px のカラムに収め、その内側で左右 16px を空ける。
              画面幅が広くてもトーストだけ広がらないようにするため */}
          <div className='w-full max-w-tool px-md'>
            <div
              role='status'
              aria-live='polite'
              className={cn(
                'rounded-sm border p-sm text-center text-xs leading-md',
                STATUS_CLASS[status],
              )}
            >
              {message}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
