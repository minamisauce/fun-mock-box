import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { LeaveConfirmDialog } from '~/components/LeaveConfirmDialog';
import { ProgressBar } from '~/components/ProgressBar';
import { ToolLayout } from '~/components/ToolLayout';
import { dataClient } from '~/data';
import { entrySheetCreateSteps } from '~/features/EntrySheet/constants/createSteps';
import { useEntrySheetCreateForm } from '~/features/EntrySheet/hooks/useEntrySheetCreateForm';
import { buildEntrySheetCreateTask } from '~/features/EntrySheet/prompts';
import { LlmGenerationPanel } from '~/features/LocalLlm/components/LlmGenerationPanel';
import { WebGpuUnsupportedNotice } from '~/features/LocalLlm/components/WebGpuUnsupportedNotice';
import { useLocalLlm } from '~/features/LocalLlm/hooks/useLocalLlm';
import { useWebGpuSupport } from '~/features/LocalLlm/hooks/useWebGpuSupport';
import { toBodyPreview } from '~/features/LocalLlm/text';
import { useStepNavigation } from '~/features/ToolWizard/useStepNavigation';
import { useAsyncAction } from '~/hooks/useAsyncAction';
import { paths } from '~/lib/paths';
import type { CreateEntrySheetRequest } from '~/types/entrySheet';

type Generated = NonNullable<CreateEntrySheetRequest['generated']>;

export function meta() {
  return [{ title: 'ES作成 | fun-mock-box' }];
}

export default function EntrySheetCreateStep() {
  const navigate = useNavigate();
  const { values, toRequest, reset, isDirty } = useEntrySheetCreateForm();
  // 保存成功後、結果画面へ移り終えるまでの状態。
  // これが無いと reset() 直後に下のガードが走ってステップ1へ飛ばされる
  const [isLeaving, setIsLeaving] = useState(false);

  const webGpu = useWebGpuSupport();
  const llm = useLocalLlm<Generated>();
  const save = useAsyncAction((request: CreateEntrySheetRequest) =>
    dataClient.entrySheets.create(request),
  );
  const isSubmitting = llm.isActive || save.isPending || isLeaving;

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

  // character_limit は任意なので toRequest() には含まれない。
  // 空文字は「指定しない」なので undefined のまま送る。
  const buildRequest = (): CreateEntrySheetRequest | null => {
    const request = toRequest();
    if (!request) return null;
    return {
      question: request.question,
      company_name: request.company_name,
      episode: request.episode,
      character_limit: values.character_limit
        ? Number(values.character_limit)
        : undefined,
    };
  };

  // 入力が揃ったら、ステップの代わりに生成画面を出す（保存は案を選んでから）
  const handleSubmit = () => {
    if (webGpu !== 'supported') return;
    const request = buildRequest();
    if (!request) {
      navigate(paths.entrySheetsNew, { replace: true });
      return;
    }
    save.clearError();
    llm.start(buildEntrySheetCreateTask(request));
  };

  const handleSave = async (generated: Generated) => {
    const request = buildRequest();
    if (!request) return;

    const created = await save.run({ ...request, generated });
    // 失敗時は save.error に載っているので、ここでは何もしない
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
        onBack={() => (llm.isActive ? llm.reset() : navigate(-1))}
        headerSlot={
          <ProgressBar
            current={llm.isActive ? entrySheetCreateSteps.length : currentStep}
            total={entrySheetCreateSteps.length}
          />
        }
      >
        {llm.isActive ? (
          <LlmGenerationPanel
            llm={llm}
            toPreview={toBodyPreview}
            onSave={handleSave}
            isSaving={save.isPending || isLeaving}
            saveError={save.error?.userMessage}
            onBack={llm.reset}
          />
        ) : (
          <>
            {webGpu === 'unsupported' && (
              <WebGpuUnsupportedNotice className='mb-md' />
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
                  isSubmitDisabled={webGpu !== 'supported'}
                />
              </motion.div>
            </AnimatePresence>
          </>
        )}
      </ToolLayout>

      {/* ステップ間（/entry-sheets/new 配下）の移動は素通し。
          保存は values を持ったまま結果画面へ出るので save.isPending で除く */}
      <LeaveConfirmDialog
        when={(isDirty || llm.isActive) && !save.isPending && !isLeaving}
        keepWithin={paths.entrySheetsNew}
      />
    </>
  );
}
