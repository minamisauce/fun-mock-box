import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ErrorNotice } from '~/components/ErrorNotice';
import { GeneratingOverlay } from '~/components/GeneratingOverlay';
import { ToolLayout } from '~/components/ToolLayout';
import { dataClient } from '~/data';
import {
  EntrySheetForm,
  type EntrySheetFormValues,
} from '~/features/EntrySheet/components/EntrySheetForm';
import { useAsyncAction } from '~/hooks/useAsyncAction';
import { GENERATING_MIN_DURATION_MS, withMinimumDuration } from '~/lib/delay';
import { paths } from '~/lib/paths';
import { TOOL_THEME } from '~/lib/toolTheme';
import type { CreateEntrySheetRequest } from '~/types/entrySheet';

const GENERATING_MESSAGES = [
  '設問とエピソードを読み取っています…',
  '構成を組み立てています…',
  '文章を作成しています…',
] as const;

const theme = TOOL_THEME['entry-sheet'];

export function meta() {
  return [{ title: 'ES作成 | fun-mock-box' }];
}

export default function EntrySheetCreate() {
  const navigate = useNavigate();
  // 生成成功後、結果画面へ移り終えるまでオーバーレイを出したままにする
  const [isLeaving, setIsLeaving] = useState(false);

  const create = useAsyncAction((request: CreateEntrySheetRequest) =>
    withMinimumDuration(
      dataClient.entrySheets.create(request),
      GENERATING_MIN_DURATION_MS,
    ),
  );
  const isSubmitting = create.isPending || isLeaving;

  const handleSubmit = async (values: EntrySheetFormValues) => {
    const created = await create.run({
      question: values.question,
      company_name: values.company_name,
      episode: values.episode,
      character_limit: values.character_limit
        ? Number(values.character_limit)
        : undefined,
    });
    // 失敗時は create.error に載っている。入力はそのまま残す
    if (!created) return;

    setIsLeaving(true);
    navigate(paths.entrySheet(created.id), { replace: true });
  };

  return (
    <>
      <ToolLayout title='ES作成・添削' onBack={() => navigate(paths.home)}>
        {create.error && (
          <ErrorNotice message={create.error.userMessage} className='mb-md' />
        )}
        <EntrySheetForm
          mode='CREATE'
          isSubmitting={isSubmitting}
          onSubmit={handleSubmit}
        />
      </ToolLayout>

      <GeneratingOverlay
        isOpen={isSubmitting}
        messages={GENERATING_MESSAGES}
        theme={theme}
      />
    </>
  );
}
