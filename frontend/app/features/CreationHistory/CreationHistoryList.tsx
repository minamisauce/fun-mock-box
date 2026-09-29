import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router';
import { ErrorNotice } from '~/components/ErrorNotice';
import type { DataError } from '~/data/errors';
import { cn } from '~/lib/cn';
import { formatDateTime } from '~/lib/formatDateTime';
import { TOOL_ICON } from '~/lib/toolIcon';
import { TOOL_THEME, type ToolId } from '~/lib/toolTheme';
import type { HistoryItem } from './types';

/**
 * どのツールの文章かを示すラベル。
 * 画面上はアイコンだけで示すので、読み上げ用の代替テキストとして使う。
 */
const TOOL_LABEL: Record<ToolId, string> = {
  'self-promotion': '自己PR',
  motivation: '志望動機',
  'entry-sheet': 'ES',
};

type Props = {
  items: HistoryItem[];
  isLoading: boolean;
  error: DataError | null;
  onRetry: () => void;
  /** 0件のときの文言。省略すると 0件では何も描画しない（ホーム用） */
  emptyMessage?: string;
  /**
   * 取得中に出すスケルトンの行数。
   * 表示件数を絞る側（ホーム）は絞った件数を渡す。既定の3行のままだと
   * 取得完了の瞬間に高さが縮んで下のセクションが跳ねる。
   */
  skeletonRows?: number;
};

/**
 * 作成履歴の一覧。取得中・失敗・0件・一覧の4状態をここで引き受ける。
 * ホームと作成履歴ページで同じ見た目にするため、状態分岐を呼び出し側に置かない。
 */
export function CreationHistoryList({
  items,
  isLoading,
  error,
  onRetry,
  emptyMessage,
  skeletonRows = 3,
}: Props) {
  if (isLoading) {
    // 高さを確保するだけのプレースホルダー。並び替わらないので位置を key にする
    const skeletonKeys = Array.from(
      { length: skeletonRows },
      (_, index) => `skeleton-${index}`,
    );
    return (
      <div className='flex flex-col gap-xs'>
        {skeletonKeys.map((key) => (
          <div key={key} className='h-16 animate-pulse rounded-md bg-gray-2' />
        ))}
      </div>
    );
  }

  if (error) {
    return <ErrorNotice message={error.userMessage} onRetry={onRetry} />;
  }

  if (items.length === 0) {
    if (!emptyMessage) return null;
    return <p className='text-xs leading-md text-font-gray'>{emptyMessage}</p>;
  }

  return (
    <ul className='flex flex-col gap-xs'>
      {items.map((item) => {
        const theme = TOOL_THEME[item.toolId];
        const Icon = TOOL_ICON[item.toolId];
        const updatedAt = formatDateTime(item.updated_at);

        return (
          <li key={item.id}>
            <Link
              to={item.href}
              className='flex flex-col gap-xs rounded-lg border border-border-2 bg-white p-sm transition-shadow hover:shadow-all-sides'
            >
              {updatedAt && (
                <time
                  dateTime={item.updated_at}
                  className='text-xxs text-font-gray'
                >
                  {updatedAt}
                </time>
              )}

              <div className='flex items-start gap-sm'>
                {/* 画面上はアイコンだけでツールを示すので、読み上げ用に名前を持たせる */}
                <span
                  role='img'
                  aria-label={TOOL_LABEL[item.toolId]}
                  className={cn(
                    // ツール一覧と同じ角丸四角。台座は 48px → 32px なので、
                    // 半径も rounded-xl(16px) ではなく rounded-md(8px) に落とす
                    // （32px に 16px を当てると真円になってしまう）
                    'flex size-8 shrink-0 items-center justify-center rounded-md',
                    theme.bgSoft,
                  )}
                >
                  <Icon size={16} aria-hidden className={theme.text} />
                </span>

                <div className='flex min-w-px flex-1 flex-col gap-3xs'>
                  <span className='text-sm font-bold'>{item.heading}</span>
                  <span className='line-clamp-2 text-xs text-font-gray'>
                    {item.content}
                  </span>
                </div>

                {/* ツールアイコン（16px）と釣り合う大きさにする。
                    行の高さが本文の行数で変わるので self-center で中央に置く */}
                <ChevronRight
                  size={16}
                  aria-hidden
                  className='shrink-0 self-center text-font-gray'
                />
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
