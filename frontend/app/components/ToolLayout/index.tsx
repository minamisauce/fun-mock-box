import { ChevronLeft } from 'lucide-react';
import type { ReactNode } from 'react';
import { BottomNav } from '~/components/BottomNav';
import { cn } from '~/lib/cn';

type Props = {
  title: string;
  /** 渡すと左上に戻るボタンが出る */
  onBack?: () => void;
  /** ヘッダー下に差し込む要素（ProgressBar など） */
  headerSlot?: ReactNode;
  children: ReactNode;
  className?: string;
};

/**
 * 全ツール共通のスマホ幅フレーム。
 *
 * BottomNav はここが持つ。離脱確認（LeaveConfirmDialog）は「入力があるか」を
 * 知っている必要があり、ここからは分からないので各画面側に置いている。
 */
export function ToolLayout({
  title,
  onBack,
  headerSlot,
  children,
  className,
}: Props) {
  return (
    <div className='min-h-dvh bg-gray-1'>
      <div className='mx-auto flex min-h-dvh w-full flex-col bg-white sm:w-tool sm:shadow-all-sides'>
        {/* Design System: layout/commonHeader (node 3030:2153) — px-md py-lg / border-b border-2 */}
        <header className='sticky top-0 z-10 border-b border-border-2 bg-white'>
          <div className='relative flex items-center justify-center px-md py-lg'>
            {onBack && (
              <button
                type='button'
                onClick={onBack}
                aria-label='戻る'
                className='absolute left-md flex size-6 items-center justify-center hover:opacity-60'
              >
                <ChevronLeft size={24} aria-hidden />
              </button>
            )}
            <h1 className='text-sm font-bold leading-md'>{title}</h1>
          </div>
          {headerSlot && <div className='px-md pb-md'>{headerSlot}</div>}
        </header>
        <main className={cn('flex-1 px-md py-lg', className)}>{children}</main>
        <BottomNav />
      </div>
    </div>
  );
}
