import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { ErrorNotice } from '~/components/ErrorNotice';
import { GeneratingOverlay } from '~/components/GeneratingOverlay';
import { LeaveConfirmDialog } from '~/components/LeaveConfirmDialog';
import { ProgressBar } from '~/components/ProgressBar';
import { ToolLayout } from '~/components/ToolLayout';
import { dataClient } from '~/data';
import { entrySheetCreateSteps } from '~/features/EntrySheet/constants/createSteps';
import { useEntrySheetCreateForm } from '~/features/EntrySheet/hooks/useEntrySheetCreateForm';
import { useStepNavigation } from '~/features/ToolWizard/useStepNavigation';
import { useAsyncAction } from '~/hooks/useAsyncAction';
import { GENERATING_MIN_DURATION_MS, withMinimumDuration } from '~/lib/delay';
import { paths } from '~/lib/paths';
import type { CreateEntrySheetRequest } from '~/types/entrySheet';

const GENERATING_MESSAGES = [
  '設問とエピソードを読み取っています…',
  '構成を組み立てています…',
  '文章を作成しています…',
] as const;

export function meta() {
  return [{ title: 'ES作成 | fun-mock-box' }];
}

export default function EntrySheetCreateStep() {
  const navigate = useNavigate();
  const { values, toRequest, reset, isDirty } = useEntrySheetCreateForm();
  // 生成成功後、結果画面へ移り終えるまでの状態。
  // isPending は解決した時点で false に戻るので、これが無いと
  // reset() 直後に下のガードが走ってステップ1へ飛ばされる
  const [isLeaving, setIsLeaving] = useState(false);

  const create = useAsyncAction((request: CreateEntrySheetRequest) =>
    withMinimumDuration(
      dataClient.entrySheets.create(request),
      GENERATING_MIN_DURATION_MS,
    ),
  );
  const isSubmitting = create.isPending || isLeaving;

  const { currentStep, currentStepObject, isLastStep, handleNextStep } =
    useStepNavigation(entrySheetCreateSteps, paths.entrySheetsNew);

  // 直リンク・ブラウザバック対策:
  // このステップに必要な入力が揃っていなければ先頭ステップへ戻す
  useEffect(() => {
    if (isSubmitting) return;
    if (!currentStepObject) return;
    const missing = currentStepObject.requiredParams.some(
      (key) => !values[key]?.trim(),
    );
    if (missing) {
      navigate(paths.entrySheetsNew, { replace: true });
    }
  }, [currentStepObject, values, navigate, isSubmitting]);

  const handleSubmit = async () => {
    const request = toRequest();
    if (!request) {
      navigate(paths.entrySheetsNew, { replace: true });
      return;
    }

    // character_limit は任意なので toRequest() には含まれない。
    // 空文字は「指定しない」なので undefined のまま送る。
    const created = await create.run({
      question: request.question,
      company_name: request.company_name,
      episode: request.episode,
      character_limit: values.character_limit
        ? Number(values.character_limit)
        : undefined,
    });
    // 失敗時は create.error に載っているので、ここでは何もしない
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
        title='ES作成'
        onBack={() => navigate(-1)}
        headerSlot={
          <ProgressBar
            current={currentStep}
            total={entrySheetCreateSteps.length}
          />
        }
      >
        {create.error && (
          <ErrorNotice
            message={create.error.userMessage}
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
              handleSubmit={handleSubmit}
              isSubmitting={isSubmitting}
            />
          </motion.div>
        </AnimatePresence>
      </ToolLayout>

      <GeneratingOverlay isOpen={isSubmitting} messages={GENERATING_MESSAGES} />

      {/* ステップ間（/entry-sheets/new 配下）の移動は素通し。
          送信は values を持ったまま結果画面へ出るので isSubmitting で除く */}
      <LeaveConfirmDialog
        when={isDirty && !isSubmitting}
        keepWithin={paths.entrySheetsNew}
      />
    </>
  );
}
