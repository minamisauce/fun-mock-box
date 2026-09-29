import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router';
import { CreationHistoryList } from '~/features/CreationHistory/CreationHistoryList';
import { useCreationHistory } from '~/features/CreationHistory/useCreationHistory';
import { cn } from '~/lib/cn';
import { paths } from '~/lib/paths';
import { TOOL_ICON } from '~/lib/toolIcon';
import { TOOL_THEME, type ToolId } from '~/lib/toolTheme';

export function meta() {
  return [
    { title: '就活BOX ツールモック | fun-mock-box' },
    {
      name: 'description',
      content: '自己PR・志望動機・ES作成ツールのモック',
    },
  ];
}

type ToolCard = {
  id: ToolId;
  name: string;
  to: string | null;
};

// アイコンはここに持たない。作成履歴と同じ絵を使うため ~/lib/toolIcon に集約する
const TOOLS: ToolCard[] = [
  {
    id: 'self-promotion',
    name: '自己PR作成',
    to: paths.selfPromotionsNew,
  },
  {
    id: 'motivation',
    name: '志望動機作成',
    to: paths.motivationsNew,
  },
  {
    id: 'entry-sheet',
    name: 'ES作成・添削',
    to: paths.entrySheetsNew,
  },
];

/** ホームに出す作成履歴の件数。続きは「すべて見る」から作成履歴ページで見る */
const RECENT_LIMIT = 1;

/**
 * ツールカード。
 *
 * ツール色は左のアイコンタイル（淡色の面 + ツール色のアイコン）だけで表し、
 * 枠線は border-border-2 に統一する。カードごとに枠の色が変わると
 * 3枚並んだときに主張が強すぎて、どれが押せるのかが読みにくくなるため。
 */
function ToolCardView({ tool }: { tool: ToolCard }) {
  const theme = TOOL_THEME[tool.id];
  const Icon = TOOL_ICON[tool.id];
  const enabled = tool.to !== null;

  return (
    <div
      className={cn(
        'flex items-center gap-md rounded-lg border border-border-2 p-md transition-shadow',
        enabled ? 'bg-white hover:shadow-all-sides' : 'bg-gray-1',
      )}
    >
      <span
        aria-hidden
        className={cn(
          'flex size-12 shrink-0 items-center justify-center rounded-xl',
          enabled ? theme.bgSoft : 'bg-gray-2',
        )}
      >
        <Icon size={24} className={enabled ? theme.text : 'text-font-gray'} />
      </span>

      <div className='flex min-w-px flex-1 flex-col gap-3xs'>
        <span
          className={cn(
            'text-md font-bold leading-sm',
            enabled ? 'text-black' : 'text-font-gray',
          )}
        >
          {tool.name}
        </span>
      </div>
    </div>
  );
}

export default function Home() {
  const { data, error, isLoading, refetch } = useCreationHistory();
  const history = data ?? [];

  return (
    <div className='flex flex-col gap-xxl px-md py-xxl'>
      <header className='flex flex-col gap-xs'>
        <h1 className='text-lg font-bold leading-sm'>就活BOX ツール</h1>
      </header>

      {/* 取得中・失敗も含めて、見せるものがあるときだけ節を出す。
          ツールカードは取得を待たせない */}
      {(isLoading || error || history.length > 0) && (
        <section className='flex flex-col gap-sm'>
          <div className='flex items-center justify-between gap-xs'>
            <h2 className='text-md font-bold'>最近の作成履歴</h2>
            {/* 件数に関わらず出す。ここが作成履歴ページへの主導線なので、
                「あと1件だけ」のときに導線が消えると一覧へ行けなくなる */}
            <Link
              to={paths.history}
              className='flex shrink-0 items-center gap-3xs text-xs text-font-gray hover:opacity-60'
            >
              すべて見る
              <ChevronRight size={14} aria-hidden />
            </Link>
          </div>

          <CreationHistoryList
            items={history.slice(0, RECENT_LIMIT)}
            isLoading={isLoading}
            error={error}
            onRetry={refetch}
            skeletonRows={RECENT_LIMIT}
          />
        </section>
      )}

      <section className='flex flex-col gap-sm'>
        <h2 className='text-md font-bold'>ツール一覧</h2>
        {TOOLS.map((tool) =>
          tool.to ? (
            // hover の見た目はカード側（影）が持つので、ここでは透過させない
            <Link key={tool.id} to={tool.to} className='block'>
              <ToolCardView tool={tool} />
            </Link>
          ) : (
            <ToolCardView key={tool.id} tool={tool} />
          ),
        )}
      </section>
    </div>
  );
}
