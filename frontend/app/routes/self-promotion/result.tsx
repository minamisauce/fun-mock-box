import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Button } from '~/components/Button';
import { TextArea } from '~/components/TextArea';
import { ToolLayout } from '~/components/ToolLayout';
import { paths } from '~/lib/paths';
import { getSelfPromotion, updateSelfPromotion } from '~/mocks/selfPromotion';
import type { SelfPromotionModel } from '~/types/selfPromotion';

export function meta() {
  return [{ title: '作成した自己PR | fun-mock-box' }];
}

export default function SelfPromotionResult() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [item, setItem] = useState<SelfPromotionModel | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [savedAt, setSavedAt] = useState<string | null>(null);

  // localStorage は SPA モードなのでマウント後に読む
  useEffect(() => {
    if (!id) return;
    const found = getSelfPromotion(id);
    if (!found) {
      setNotFound(true);
      return;
    }
    setItem(found);
    setTitle(found.title);
    setContent(found.content);
  }, [id]);

  const isDirty =
    item !== null && (title !== item.title || content !== item.content);

  const handleSave = () => {
    if (!id || !isDirty) return;
    const updated = updateSelfPromotion(id, { title, content });
    setItem(updated);
    setSavedAt(updated.updated_at);
  };

  if (notFound) {
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

  if (!item) {
    return (
      <ToolLayout title='作成した自己PR'>
        <div className='flex flex-col gap-md'>
          <div className='h-6 w-2/3 animate-pulse rounded-sm bg-gray-2' />
          <div className='h-40 w-full animate-pulse rounded-md bg-gray-2' />
        </div>
      </ToolLayout>
    );
  }

  return (
    <ToolLayout title='作成した自己PR' onBack={() => navigate(paths.home)}>
      <div className='flex flex-col gap-xl'>
        <div className='flex flex-col gap-xs'>
          <span className='text-xs font-bold text-font-gray'>タイトル</span>
          <input
            type='text'
            value={title}
            maxLength={40}
            onChange={(e) => setTitle(e.target.value)}
            // Design System: input/textField (node 3014:1434) と同じ寸法
            className='w-full rounded-md border border-border-2 px-md py-sm text-sm font-bold leading-md focus:border-black focus:outline-none'
          />
        </div>

        <div className='flex flex-col gap-xs'>
          <span className='text-xs font-bold text-font-gray'>本文</span>
          <TextArea
            value={content}
            onChange={setContent}
            minRows={12}
            showCount
            showCopy
          />
        </div>

        <div className='flex flex-col gap-sm'>
          <Button text='保存する' onClick={handleSave} disabled={!isDirty} />
          <Button
            text='もう一度作成する'
            variant='outline'
            onClick={() => navigate(paths.selfPromotionsNew)}
          />
        </div>

        {savedAt && !isDirty && (
          <p className='text-center text-xs text-font-gray'>保存しました</p>
        )}
      </div>
    </ToolLayout>
  );
}
