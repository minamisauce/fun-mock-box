import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router';
import { ErrorNotice } from '~/components/ErrorNotice';
import { dataClient } from '~/data';
import { useAsyncData } from '~/hooks/useAsyncData';
import { cn } from '~/lib/cn';
import { paths } from '~/lib/paths';
import { TOOL_THEME, type ToolId } from '~/lib/toolTheme';
import type { EntrySheetModel } from '~/types/entrySheet';
import type { MotivationModel } from '~/types/motivation';
import type { SelfPromotionModel } from '~/types/selfPromotion';

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
  description: string;
  to: string | null;
};

/** 保存リストでどのツールの文章かを示すラベル */
const TOOL_LABEL: Record<ToolId, string> = {
  'self-promotion': '自己PR',
  motivation: '志望動機',
  'entry-sheet': 'ES',
};

const TOOLS: ToolCard[] = [
  {
    id: 'self-promotion',
    name: '自己PR作成',
    description: '4つの質問に答えるだけで自己PRが完成します',
    to: paths.selfPromotionsNew,
  },
  {
    id: 'motivation',
    name: '志望動機作成',
    description: '業界・業種から志望動機を組み立てます',
    to: paths.motivationsNew,
  },
  {
    id: 'entry-sheet',
    name: 'ES作成・添削',
    description: '設問と企業名からESを作成・添削します',
    to: paths.entrySheetsNew,
  },
];

function ToolCardView({ tool }: { tool: ToolCard }) {
  const theme = TOOL_THEME[tool.id];
  return (
    <div
      className={cn(
        'flex flex-col gap-xxs rounded-lg border-2 p-md',
        tool.to ? cn(theme.border, 'bg-white') : 'border-border-2 bg-gray-1',
      )}
    >
      <div className='flex items-center justify-between'>
        <span
          className={cn(
            'text-md font-bold',
            tool.to ? theme.text : 'text-font-gray',
          )}
        >
          {tool.name}
        </span>
        {tool.to ? (
          <ChevronRight size={24} aria-hidden className='text-font-gray' />
        ) : (
          <span className='rounded-infinity bg-gray-3 px-xs py-3xs text-xxs text-font-gray'>
            準備中
          </span>
        )}
      </div>
      <p className='text-xs leading-md text-font-gray'>{tool.description}</p>
    </div>
  );
}

/** 保存リストの表示用。ES はタイトルを持たないので設問を見出しにする */
type SavedItem = {
  id: string;
  toolId: ToolId;
  href: string;
  heading: string;
  content: string;
  created_at: string;
};

/** 3ツールの結果を1本の新しい順リストにまとめる */
function mergeSavedItems(
  selfPromotions: SelfPromotionModel[],
  motivations: MotivationModel[],
  entrySheets: EntrySheetModel[],
): SavedItem[] {
  return [
    ...selfPromotions.map((item) => ({
      id: item.id,
      toolId: 'self-promotion' as const,
      href: paths.selfPromotion(item.id),
      heading: item.title,
      content: item.content,
      created_at: item.created_at,
    })),
    ...motivations.map((item) => ({
      id: item.id,
      toolId: 'motivation' as const,
      href: paths.motivation(item.id),
      heading: item.title,
      content: item.content,
      created_at: item.created_at,
    })),
    ...entrySheets.map((item) => ({
      id: item.id,
      toolId: 'entry-sheet' as const,
      href: paths.entrySheet(item.id),
      heading: `${item.company_name}／${item.question}`,
      content: item.content,
      created_at: item.created_at,
    })),
  ].sort((a, b) => b.created_at.localeCompare(a.created_at));
}

const SKELETON_ROWS = ['a', 'b', 'c'];

export default function Home() {
  // 3本まとめて1つのローディングにする。マージ済みの1リストを出すので、
  // 部分的に表示すると並び順が崩れて見える
  const { data, error, isLoading, refetch } = useAsyncData(
    (signal) =>
      Promise.all([
        dataClient.selfPromotions.list(signal),
        dataClient.motivations.list(signal),
        dataClient.entrySheets.list(signal),
      ]).then(([selfPromotions, motivations, entrySheets]) =>
        mergeSavedItems(selfPromotions, motivations, entrySheets),
      ),
    [],
  );
  const saved = data ?? [];

  return (
    <div className='min-h-dvh bg-gray-1'>
      <div className='mx-auto flex min-h-dvh w-full flex-col gap-xxl bg-white px-md py-xxl sm:w-tool sm:shadow-all-sides'>
        <header className='flex flex-col gap-xs'>
          <h1 className='text-xl font-bold leading-sm'>就活BOX ツール</h1>
          <p className='text-xs text-font-gray'>
            バックエンドなしで動くモックです
          </p>
        </header>

        <section className='flex flex-col gap-sm'>
          {TOOLS.map((tool) =>
            tool.to ? (
              <Link key={tool.id} to={tool.to} className='hover:opacity-60'>
                <ToolCardView tool={tool} />
              </Link>
            ) : (
              <ToolCardView key={tool.id} tool={tool} />
            ),
          )}
        </section>

        {/* 取得中・失敗も含めて、見せるものがあるときだけ節を出す。
            ツールカードは取得を待たせない */}
        {(isLoading || error || saved.length > 0) && (
          <section className='flex flex-col gap-sm'>
            <h2 className='text-md font-bold'>作成した文章</h2>

            {isLoading && (
              <div className='flex flex-col gap-xs'>
                {SKELETON_ROWS.map((key) => (
                  <div
                    key={key}
                    className='h-16 animate-pulse rounded-md bg-gray-2'
                  />
                ))}
              </div>
            )}

            {error && (
              <ErrorNotice message={error.userMessage} onRetry={refetch} />
            )}

            <ul className='flex flex-col gap-xs'>
              {saved.map((item) => (
                <li key={item.id}>
                  <Link
                    to={item.href}
                    className='flex flex-col gap-3xs rounded-md border border-border-2 p-sm hover:opacity-60'
                  >
                    <span
                      className={cn(
                        'text-xxs font-bold',
                        TOOL_THEME[item.toolId].text,
                      )}
                    >
                      {TOOL_LABEL[item.toolId]}
                    </span>
                    <span className='text-sm font-bold'>{item.heading}</span>
                    <span className='line-clamp-2 text-xs text-font-gray'>
                      {item.content}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
