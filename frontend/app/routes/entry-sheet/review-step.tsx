import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { ErrorNotice } from '~/components/ErrorNotice';
import { GeneratingOverlay } from '~/components/GeneratingOverlay';
import { ProgressBar } from '~/components/ProgressBar';
import { ToolLayout } from '~/components/ToolLayout';
import { dataClient } from '~/data';
import { entrySheetReviewSteps } from '~/features/EntrySheet/constants/reviewSteps';
import { useEntrySheetReviewForm } from '~/features/EntrySheet/hooks/useEntrySheetReviewForm';
import { useStepNavigation } from '~/features/ToolWizard/useStepNavigation';
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

export default function EntrySheetReviewStep() {
  const navigate = useNavigate();
  const { values, toRequest, reset } = useEntrySheetReviewForm();
  // 添削成功後、結果画面へ移り終えるまでの状態。
  // isPending は解決した時点で false に戻るので、これが無いと
  // reset() 直後に下のガードが走ってステップ1へ飛ばされる
  const [isLeaving, setIsLeaving] = useState(false);

  const review = useAsyncAction((request: ReviewEntrySheetRequest) =>
    withMinimumDuration(
      dataClient.entrySheets.review(request),
      GENERATING_MIN_DURATION_MS,
    ),
  );
  const isSubmitting = review.isPending || isLeaving;

  const { currentStep, currentStepObject, isLastStep, handleNextStep } =
    useStepNavigation(entrySheetReviewSteps, paths.entrySheetsReviewNew);

  // 直リンク・ブラウザバック対策:
  // このステップに必要な入力が揃っていなければ先頭ステップへ戻す
  useEffect(() => {
    if (isSubmitting) return;
    if (!currentStepObject) return;
    const missing = currentStepObject.requiredParams.some(
      (key) => !values[key]?.trim(),
    );
    if (missing) {
      navigate(paths.entrySheetsReviewNew, { replace: true });
    }
  }, [currentStepObject, values, navigate, isSubmitting]);

  const handleSubmit = async () => {
    const request = toRequest();
    if (!request) {
      navigate(paths.entrySheetsReviewNew, { replace: true });
      return;
    }

    const created = await review.run(request);
    // 失敗時は review.error に載っているので、ここでは何もしない
    if (!created) return;

    setIsLeaving(true);
    // navigate を先に呼ぶ。reset() を先にすると values が空になった状態で
    // 上のガードが走り、結果画面ではなくステップ1へ戻ってしまう。
    navigate(paths.entrySheet(created.id), { replace: true });
    reset();
  };

  // useStepNavigation が先頭ステップへリダイレクトするまでの間
  if (!currentStepObject) return null;

  const StepComponent = currentStepObject.component;

  return (
    <>
      <ToolLayout
        title='ES対策ツール'
        onBack={() => navigate(-1)}
        headerSlot={
          <ProgressBar
            current={currentStep}
            total={entrySheetReviewSteps.length}
            theme={theme}
          />
        }
      >
        {review.error && (
          <ErrorNotice
            message={review.error.userMessage}
            className='mb-md'
            onRetry={handleSubmit}
          />
        )}

        <AnimatePresence mode='wait'>
          <motion.div
            key={currentStepObject.id}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.2 }}
          >
            <StepComponent
              label={currentStepObject.label}
              handleNextStep={isLastStep ? handleSubmit : handleNextStep}
              isSubmitting={isSubmitting}
            />
          </motion.div>
        </AnimatePresence>
      </ToolLayout>

      <GeneratingOverlay
        isOpen={isSubmitting}
        messages={GENERATING_MESSAGES}
        theme={theme}
      />
    </>
  );
}
