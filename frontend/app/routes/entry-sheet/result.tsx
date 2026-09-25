import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Button } from '~/components/Button';
import { Tabs } from '~/components/Tabs';
import { TextArea } from '~/components/TextArea';
import { ToolLayout } from '~/components/ToolLayout';
import { paths } from '~/lib/paths';
import { TOOL_THEME } from '~/lib/toolTheme';
import { getEntrySheet, updateEntrySheet } from '~/mocks/entrySheet';
import type { EntrySheetModel } from '~/types/entrySheet';

const theme = TOOL_THEME['entry-sheet'];

type Tab = 'content' | 'explanation';

const TAB_OPTIONS = [
  { label: '文章', value: 'content' as const },
  { label: 'AIの解説', value: 'explanation' as const },
];

export function meta() {
  return [{ title: '作成したES | fun-mock-box' }];
}

/** AI解説。作成と添削でスキーマが違うので出し分ける */
function AiExplanation({ item }: { item: EntrySheetModel }) {
  if (item.ai_explanation_schema_version === 'CREATE_V1') {
    return (
      <div className='flex flex-col gap-sm'>
        {item.ai_explanation_json.map((entry) => (
          <div
            key={entry.title}
            className='flex flex-col gap-xxs rounded-md border border-border-2 p-md'
          >
            <span className='text-sm font-bold leading-md'>{entry.title}</span>
            <p className='text-xs leading-lg text-black'>{entry.content}</p>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className='flex flex-col gap-sm'>
      {item.ai_explanation_json.map((entry) => (
        <div
          key={entry.title}
          className='flex flex-col gap-xs rounded-md border border-border-2 p-md'
        >
          <span className='text-sm font-bold leading-md'>{entry.title}</span>

          <div className='flex flex-col gap-3xs'>
            <span className='text-xxs font-bold text-font-gray'>修正前</span>
            <p className='rounded-sm bg-gray-2 p-xs text-xs leading-md text-font-gray line-through decoration-font-gray'>
              {entry.before}
            </p>
          </div>

          <div className='flex flex-col gap-3xs'>
            <span className='text-xxs font-bold text-primary-entry-sheet'>
              修正後
            </span>
            <p className='rounded-sm bg-entry-sheet-90 p-xs text-xs leading-md text-black'>
              {entry.after}
            </p>
          </div>

          <p className='text-xs leading-lg text-black'>{entry.comment}</p>
        </div>
      ))}
    </div>
  );
}

export default function EntrySheetResult() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [item, setItem] = useState<EntrySheetModel | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [content, setContent] = useState('');
  const [tab, setTab] = useState<Tab>('content');
  const [saved, setSaved] = useState(false);

  // localStorage は SPA モードなのでマウント後に読む
  useEffect(() => {
    if (!id) return;
    const found = getEntrySheet(id);
    if (!found) {
      setNotFound(true);
      return;
    }
    setItem(found);
    setContent(found.content);
  }, [id]);

  const isDirty = item !== null && content !== item.content;

  const handleSave = () => {
    if (!id || !isDirty) return;
    setItem(updateEntrySheet(id, { content }));
    setSaved(true);
  };

  if (notFound) {
    return (
      <ToolLayout title='作成したES' onBack={() => navigate(paths.home)}>
        <div className='flex flex-col items-center gap-lg py-3xl'>
          <p className='text-sm text-font-gray'>
            このESは見つかりませんでした。
          </p>
          <Button
            text='トップへ戻る'
            variant='outline'
            theme={theme}
            onClick={() => navigate(paths.home)}
          />
        </div>
      </ToolLayout>
    );
  }

  if (!item) {
    return (
      <ToolLayout title='作成したES'>
        <div className='flex flex-col gap-md'>
          <div className='h-6 w-2/3 animate-pulse rounded-sm bg-gray-2' />
          <div className='h-40 w-full animate-pulse rounded-md bg-gray-2' />
        </div>
      </ToolLayout>
    );
  }

  const isReview = item.type === 'REVIEW';

  return (
    <ToolLayout
      title={isReview ? '添削したES' : '作成したES'}
      onBack={() => navigate(paths.home)}
    >
      <div className='flex flex-col gap-xl'>
        <div className='flex flex-col gap-3xs rounded-md bg-gray-2 p-md'>
          <span className='text-xxs font-bold text-font-gray'>
            {item.company_name}
          </span>
          <span className='text-sm font-bold leading-md'>{item.question}</span>
        </div>

        <Tabs options={TAB_OPTIONS} value={tab} onChange={setTab} />

        {tab === 'content' ? (
          <div className='flex flex-col gap-xl'>
            {isReview && item.original_content && (
              <div className='flex flex-col gap-xs'>
                <span className='text-xs font-bold text-font-gray'>添削前</span>
                <p className='whitespace-pre-wrap rounded-md bg-gray-2 p-md text-xs leading-lg text-font-gray'>
                  {item.original_content}
                </p>
              </div>
            )}

            <div className='flex flex-col gap-xs'>
              <span className='text-xs font-bold text-font-gray'>
                {isReview ? '添削後' : '本文'}
              </span>
              <TextArea
                value={content}
                onChange={setContent}
                minRows={12}
                showCount
                showCopy
              />
            </div>

            <div className='flex flex-col gap-sm'>
              <Button
                text='保存する'
                theme={theme}
                onClick={handleSave}
                disabled={!isDirty}
              />
              <Button
                text='もう一度作成する'
                variant='outline'
                theme={theme}
                onClick={() =>
                  navigate(
                    isReview
                      ? paths.entrySheetsReviewNew
                      : paths.entrySheetsNew,
                  )
                }
              />
            </div>

            {saved && !isDirty && (
              <p className='text-center text-xs text-font-gray'>保存しました</p>
            )}
          </div>
        ) : (
          <AiExplanation item={item} />
        )}
      </div>
    </ToolLayout>
  );
}
