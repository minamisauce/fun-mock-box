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
import type { ReviewEntrySheetRequest } from '~/types/entrySheet';

const GENERATING_MESSAGES = [
  '文章を読み込んでいます…',
  '改善点を洗い出しています…',
  '添削案を作成しています…',
] as const;

const theme = TOOL_THEME['entry-sheet'];

export function meta() {
  return [{ title: 'ES添削 | fun-mock-box' }];
}

export default function EntrySheetReview() {
  const navigate = useNavigate();
  // 添削成功後、結果画面へ移り終えるまでオーバーレイを出したままにする
  const [isLeaving, setIsLeaving] = useState(false);

  const review = useAsyncAction((request: ReviewEntrySheetRequest) =>
    withMinimumDuration(
      dataClient.entrySheets.review(request),
      GENERATING_MIN_DURATION_MS,
    ),
  );
  const isSubmitting = review.isPending || isLeaving;

  const handleSubmit = async (values: EntrySheetFormValues) => {
    const created = await review.run({
      question: values.question,
      company_name: values.company_name,
      original_content: values.original_content,
    });
    // 失敗時は review.error に載っている。入力はそのまま残す
    if (!created) return;

    setIsLeaving(true);
    navigate(paths.entrySheet(created.id), { replace: true });
  };

  return (
    <>
      <ToolLayout title='ES作成・添削' onBack={() => navigate(paths.home)}>
        {review.error && (
          <ErrorNotice message={review.error.userMessage} className='mb-md' />
        )}
        <EntrySheetForm
          mode='REVIEW'
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
