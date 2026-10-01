import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';

type Props = {
  isOpen: boolean;
  /** 順に切り替えて表示する段階メッセージ */
  messages: readonly string[];
  /** 1メッセージあたりの表示時間(ms) */
  intervalMs?: number;
};

/** 擬似AI生成中の全画面オーバーレイ */
export function GeneratingOverlay({
  isOpen,
  messages,
  intervalMs = 1000,
}: Props) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setIndex(0);
      return;
    }
    const timer = setInterval(() => {
      // 最後のメッセージで止める（生成完了までそのまま出し続ける）
      setIndex((prev) => Math.min(prev + 1, messages.length - 1));
    }, intervalMs);
    return () => clearInterval(timer);
  }, [isOpen, intervalMs, messages.length]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className='fixed inset-0 z-50 flex flex-col items-center justify-center gap-lg bg-white/95'
        >
          <span className='size-12 animate-spin rounded-infinity border-4 border-primary border-t-transparent' />
          <AnimatePresence mode='wait'>
            <motion.p
              key={index}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
              className='text-md font-bold text-black'
            >
              {messages[index]}
            </motion.p>
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
