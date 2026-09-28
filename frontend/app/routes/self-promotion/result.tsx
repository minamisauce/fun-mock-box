import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Button } from '~/components/Button';
import { ErrorNotice } from '~/components/ErrorNotice';
import { TextArea } from '~/components/TextArea';
import { ToolLayout } from '~/components/ToolLayout';
import { dataClient } from '~/data';
import { useAsyncAction } from '~/hooks/useAsyncAction';
import { useAsyncData } from '~/hooks/useAsyncData';
import { paths } from '~/lib/paths';
import type {
  SelfPromotionModel,
  UpdateSelfPromotionRequest,
} from '~/types/selfPromotion';

export function meta() {
  return [{ title: '作成した自己PR | fun-mock-box' }];
}

export default function SelfPromotionResult() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data, error, isLoading, refetch } = useAsyncData(
    (signal) =>
      id ? dataClient.selfPromotions.get(id, signal) : Promise.resolve(null),
    [id],
  );

  if (isLoading) {
    return (
      <ToolLayout title='作成した自己PR'>
        <div className='flex flex-col gap-md'>
          <div className='h-6 w-2/3 animate-pulse rounded-sm bg-gray-2' />
          <div className='h-40 w-full animate-pulse rounded-md bg-gray-2' />
        </div>
      </ToolLayout>
    );
  }

  if (error) {
    return (
      <ToolLayout title='作成した自己PR' onBack={() => navigate(paths.home)}>
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
      <ToolLayout title='作成した自己PR' onBack={() => navigate(paths.home)}>
        <div className='flex flex-col items-center gap-lg py-3xl'>
          <p className='text-md text-font-gray'>
            この自己PRは見つかりませんでした。
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
  // id が変わったときに前の自己PRの入力が残らない
  return <SelfPromotionEditor key={data.id} item={data} />;
}

function SelfPromotionEditor({ item }: { item: SelfPromotionModel }) {
  const navigate = useNavigate();

  // 保存済みの内容。編集中かどうかの判定はこれと比べる
  const [saved, setSaved] = useState({
    title: item.title,
    content: item.content,
  });
  const [title, setTitle] = useState(item.title);
  const [content, setContent] = useState(item.content);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  const save = useAsyncAction((patch: UpdateSelfPromotionRequest) =>
    dataClient.selfPromotions.update(item.id, patch),
  );

  const isDirty = title !== saved.title || content !== saved.content;

  const handleSave = async () => {
    if (!isDirty) return;
    const updated = await save.run({ title, content });
    // 失敗しても入力は消さない。save.error に文言が載る
    if (!updated) return;
    setSaved({ title: updated.title, content: updated.content });
    setSavedAt(updated.updated_at);
  };

  return (
    <ToolLayout title='作成した自己PR' onBack={() => navigate(paths.home)}>
      <div className='flex flex-col gap-xl'>
        <div className='flex flex-col gap-xs'>
          <span className='text-xs font-bold text-font-gray'>タイトル</span>
          <input
            type='text'
            value={title}
            maxLength={40}
            onChange={(e) => {
              setTitle(e.target.value);
              save.clearError();
            }}
            // Design System: input/textField (node 3014:1434) と同じ寸法
            className='w-full rounded-md border border-border-2 px-md py-sm text-sm font-bold leading-md focus:border-black focus:outline-none'
          />
        </div>

        <div className='flex flex-col gap-xs'>
          <span className='text-xs font-bold text-font-gray'>本文</span>
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
            text='保存する'
            onClick={handleSave}
            disabled={!isDirty}
            isPending={save.isPending}
          />
          <Button
            text='もう一度作成する'
            variant='outline'
            onClick={() => navigate(paths.selfPromotionsNew)}
          />
        </div>

        {save.error && <ErrorNotice message={save.error.userMessage} />}

        {savedAt && !isDirty && (
          <p className='text-center text-xs text-font-gray'>保存しました</p>
        )}
      </div>
    </ToolLayout>
  );
}
