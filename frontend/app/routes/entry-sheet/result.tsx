import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Button } from '~/components/Button';
import { ErrorNotice } from '~/components/ErrorNotice';
import { LeaveConfirmDialog } from '~/components/LeaveConfirmDialog';
import { Tabs } from '~/components/Tabs';
import { TextArea } from '~/components/TextArea';
import { Toast } from '~/components/Toast';
import { ToolLayout } from '~/components/ToolLayout';
import { dataClient } from '~/data';
import { ENTRY_SHEETS_TEXT } from '~/features/EntrySheet/constants';
import { useAsyncAction } from '~/hooks/useAsyncAction';
import { useAsyncData } from '~/hooks/useAsyncData';
import { paths } from '~/lib/paths';
import { toolScope } from '~/lib/toolScope';
import type {
  EntrySheetModel,
  UpdateEntrySheetRequest,
} from '~/types/entrySheet';

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
            <span className='text-xxs font-bold text-primary'>修正後</span>
            <p className='rounded-sm bg-primary-soft p-xs text-xs leading-md text-black'>
              {entry.after}
            </p>
          </div>

          <p className='text-xs leading-lg text-black'>{entry.comment}</p>
        </div>
      ))}
    </div>
  );
}

/**
 * ES結果画面は作成・添削どちらからも来るため、routes.ts では
 * create-layout / review-layout の**外**に置いている。
 * そのぶんツール色のスコープがレイアウトから降ってこないので、ここで開く。
 */
export default function EntrySheetResultRoute() {
  return (
    <div {...toolScope('entry-sheet')}>
      <EntrySheetResult />
    </div>
  );
}

function EntrySheetResult() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data, error, isLoading, refetch } = useAsyncData(
    (signal) =>
      id ? dataClient.entrySheets.get(id, signal) : Promise.resolve(null),
    [id],
  );

  if (isLoading) {
    return (
      <ToolLayout title='作成したES'>
        <div className='flex flex-col gap-md'>
          <div className='h-6 w-2/3 animate-pulse rounded-sm bg-gray-2' />
          <div className='h-40 w-full animate-pulse rounded-md bg-gray-2' />
        </div>
      </ToolLayout>
    );
  }

  if (error) {
    return (
      <ToolLayout title='作成したES' onBack={() => navigate(paths.home)}>
        <div className='flex flex-col gap-lg py-xl'>
          <ErrorNotice message={error.userMessage} onRetry={refetch} />
          <Button
            text='トップへ戻る'
            variant='outline'
            onClick={() => navigate(paths.home)}
          />
        </div>
      </ToolLayout>
    );
  }

  if (!data) {
    return (
      <ToolLayout title='作成したES' onBack={() => navigate(paths.home)}>
        <div className='flex flex-col items-center gap-lg py-3xl'>
          <p className='text-sm text-font-gray'>
            このESは見つかりませんでした。
          </p>
          <Button
            text='トップへ戻る'
            variant='outline'
            onClick={() => navigate(paths.home)}
          />
        </div>
      </ToolLayout>
    );
  }

  // key で作り直す。編集中の state を取得結果に同期させる effect が要らなくなり、
  // id が変わったときに前のESの入力が残らない
  return <EntrySheetEditor key={data.id} item={data} />;
}

function EntrySheetEditor({ item }: { item: EntrySheetModel }) {
  const navigate = useNavigate();

  // 保存済みの本文。編集中かどうかの判定はこれと比べる
  const [saved, setSaved] = useState(item.content);
  const [content, setContent] = useState(item.content);
  // 更新成功で出すトースト。null の間は出ない
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>('content');

  const save = useAsyncAction((patch: UpdateEntrySheetRequest) =>
    dataClient.entrySheets.update(item.id, patch),
  );

  const isDirty = content !== saved;

  const handleSave = async () => {
    if (!isDirty) return;
    const updated = await save.run({ content });
    // 失敗しても入力は消さない。save.error に文言が載る
    if (!updated) return;
    setSaved(updated.content);
    setToastMessage('更新しました');
  };

  const isReview = item.type === 'REVIEW';
  // 文字数は作成モデルにしかない。union の narrowing のためここで取り出す
  const characterLimit = item.type === 'CREATE' ? item.character_limit : null;

  return (
    <>
      <ToolLayout
        title={isReview ? '添削したES' : '作成したES'}
        onBack={() => navigate(paths.home)}
      >
        <div className='flex flex-col gap-xl'>
          <div className='flex flex-col gap-xs rounded-md bg-gray-2 p-md'>
            <div className='flex flex-col gap-3xs'>
              <span className='text-xxs font-bold text-font-gray'>
                {item.company_name}
              </span>
              <span className='text-sm font-bold leading-md'>
                {item.question}
              </span>
            </div>

            {/* 文字数は作成時だけの指定。何文字以内で作ったかが後から分かるように出す */}
            {characterLimit && (
              <span className='w-fit rounded-infinity bg-white px-xs py-3xs text-xxs text-font-gray'>
                {characterLimit}
                {ENTRY_SHEETS_TEXT.characterLimit.suffix}
              </span>
            )}
          </div>

          <Tabs options={TAB_OPTIONS} value={tab} onChange={setTab} />

          {tab === 'content' ? (
            <div className='flex flex-col gap-xl'>
              {isReview && item.original_content && (
                <div className='flex flex-col gap-xs'>
                  <span className='text-xs font-bold text-font-gray'>
                    添削前
                  </span>
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
                  onChange={(value) => {
                    setContent(value);
                    save.clearError();
                  }}
                  minRows={12}
                  showCount
                  showCopy
                />
              </div>

              <div className='flex flex-col gap-sm'>
                <Button
                  text='更新する'
                  onClick={handleSave}
                  disabled={!isDirty}
                  isPending={save.isPending}
                />
                <Button
                  text='もう一度作成する'
                  variant='outline'
                  onClick={() =>
                    navigate(
                      isReview
                        ? paths.entrySheetsReviewNew
                        : paths.entrySheetsNew,
                    )
                  }
                />
              </div>

              {save.error && <ErrorNotice message={save.error.userMessage} />}
            </div>
          ) : (
            <AiExplanation item={item} />
          )}
        </div>
      </ToolLayout>

      <Toast message={toastMessage} onClose={() => setToastMessage(null)} />

      {/* 未保存の編集がある間だけ。保存済みなら離れても失うものがないので出さない */}
      <LeaveConfirmDialog
        when={isDirty}
        keepWithin={paths.entrySheet(item.id)}
      />
    </>
  );
}
