import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router';
import { PageHeader } from '~/components/PageHeader';
import { CreationHistoryList } from '~/features/CreationHistory/CreationHistoryList';
import { useCreationHistory } from '~/features/CreationHistory/useCreationHistory';
import { cn } from '~/lib/cn';
import { paths } from '~/lib/paths';
import { TOOL_ACTION, type ToolActionId } from '~/lib/toolAction';
import { toolScope } from '~/lib/toolScope';

export function meta() {
  return [
    { title: 'fun-mock-boxモック | fun-mock-box' },
    {
      name: 'description',
      content: '自己PR・志望動機・ES作成ツールのモック',
    },
  ];
}

type ToolCard = {
  actionId: ToolActionId;
  name: string;
  to: string | null;
};

/**
 * ES は「これから書く」と「書いたものを直す」で入力も結果も別物なので、
 * ツール内のタブではなくホームから入口を分ける。
 * ラベルとアイコンは ~/lib/toolAction に集約（作成履歴と共通）。
 */
const TOOLS: ToolCard[] = [
  {
    actionId: 'self-promotion',
    name: '自己PR作成',
    to: paths.selfPromotionsNew,
  },
  {
    actionId: 'motivation',
    name: '志望動機作成',
    to: paths.motivationsNew,
  },
  {
    actionId: 'entry-sheet-create',
    name: 'ES作成',
    to: paths.entrySheetsNew,
  },
  {
    actionId: 'entry-sheet-review',
    name: 'ES添削',
    to: paths.entrySheetsReviewNew,
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
 *
 * ここは1画面に3ツールが並ぶので、ツール色のスコープはカード単位で開く。
 */
function ToolCardView({ tool }: { tool: ToolCard }) {
  const action = TOOL_ACTION[tool.actionId];
  const Icon = action.icon;
  const enabled = tool.to !== null;

  return (
    <div
      {...toolScope(action.toolId)}
      className={cn(
        'flex items-center gap-md rounded-lg border border-border-2 p-md transition-shadow',
        enabled ? 'bg-white hover:shadow-all-sides' : 'bg-gray-1',
      )}
    >
      <span
        aria-hidden
        className={cn(
          'flex size-12 shrink-0 items-center justify-center rounded-xl',
          enabled ? 'bg-primary-soft' : 'bg-gray-2',
        )}
      >
        <Icon
          size={24}
          className={enabled ? 'text-primary' : 'text-font-gray'}
        />
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
    <>
      {/* ブランド色のヘッダー → グレーの地 → 白いカード、の3層で奥行きを作る */}
      <PageHeader title='fun mock box' variant='brand' />

      <div className='flex flex-col gap-xxl px-md py-xl'>
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
              <Link key={tool.actionId} to={tool.to} className='block'>
                <ToolCardView tool={tool} />
              </Link>
            ) : (
              <ToolCardView key={tool.actionId} tool={tool} />
            ),
          )}
        </section>
      </div>
    </>
  );
}
