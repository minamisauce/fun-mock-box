import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Button } from '~/components/Button';
import { TextArea } from '~/components/TextArea';
import { ToolLayout } from '~/components/ToolLayout';
import { paths } from '~/lib/paths';
import { TOOL_THEME } from '~/lib/toolTheme';
import { getMotivation, updateMotivation } from '~/mocks/motivation';
import type { MotivationModel } from '~/types/motivation';

const theme = TOOL_THEME.motivation;

export function meta() {
  return [{ title: '作成した志望動機 | fun-mock-box' }];
}

export default function MotivationResult() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [item, setItem] = useState<MotivationModel | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [saved, setSaved] = useState(false);

  // localStorage は SPA モードなのでマウント後に読む
  useEffect(() => {
    if (!id) return;
    const found = getMotivation(id);
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
    setItem(updateMotivation(id, { title, content }));
    setSaved(true);
  };

  if (notFound) {
    return (
      <ToolLayout title='作成した志望動機' onBack={() => navigate(paths.home)}>
        <div className='flex flex-col items-center gap-lg py-3xl'>
          <p className='text-sm text-font-gray'>
            この志望動機は見つかりませんでした。
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
      <ToolLayout title='作成した志望動機'>
        <div className='flex flex-col gap-md'>
          <div className='h-6 w-2/3 animate-pulse rounded-sm bg-gray-2' />
          <div className='h-40 w-full animate-pulse rounded-md bg-gray-2' />
        </div>
      </ToolLayout>
    );
  }

  return (
    <ToolLayout title='作成した志望動機' onBack={() => navigate(paths.home)}>
      <div className='flex flex-col gap-xl'>
        <div className='flex flex-col gap-xs'>
          <span className='text-xs font-bold text-font-gray'>タイトル</span>
          <input
            type='text'
            value={title}
            maxLength={40}
            onChange={(e) => setTitle(e.target.value)}
            className='w-full rounded-md border border-border-2 px-md py-sm text-sm font-bold leading-md focus:border-black focus:outline-none'
          />
        </div>

        <div className='flex flex-col gap-xs'>
          <span className='text-xs font-bold text-font-gray'>本文</span>
          <TextArea
            value={content}
            onChange={setContent}
            minRows={14}
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
            onClick={() => navigate(paths.motivationsNew)}
          />
        </div>

        {saved && !isDirty && (
          <p className='text-center text-xs text-font-gray'>保存しました</p>
        )}
      </div>
    </ToolLayout>
  );
}
