import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { LeaveConfirmDialog } from '~/components/LeaveConfirmDialog';
import { ProgressBar } from '~/components/ProgressBar';
import { ToolLayout } from '~/components/ToolLayout';
import { dataClient } from '~/data';
import { LlmGenerationPanel } from '~/features/LocalLlm/components/LlmGenerationPanel';
import { WebGpuUnsupportedNotice } from '~/features/LocalLlm/components/WebGpuUnsupportedNotice';
import { useLocalLlm } from '~/features/LocalLlm/hooks/useLocalLlm';
import { useWebGpuSupport } from '~/features/LocalLlm/hooks/useWebGpuSupport';
import { splitTitle } from '~/features/LocalLlm/text';
import { selfPromotionSteps } from '~/features/SelfPromotion/constants/steps';
import { useSelfPromotionForm } from '~/features/SelfPromotion/hooks/useSelfPromotionForm';
import { buildSelfPromotionTask } from '~/features/SelfPromotion/prompt';
import { useStepNavigation } from '~/features/ToolWizard/useStepNavigation';
import { useAsyncAction } from '~/hooks/useAsyncAction';
import { paths } from '~/lib/paths';
import type { CreateSelfPromotionRequest } from '~/types/selfPromotion';

type Generated = NonNullable<CreateSelfPromotionRequest['generated']>;

export function meta() {
  return [{ title: '自己PR作成 | fun-mock-box' }];
}

export default function SelfPromotionNewStep() {
  const navigate = useNavigate();
  const { values, toRequest, reset, isDirty } = useSelfPromotionForm();
  // 保存成功後、結果画面へ移り終えるまでの状態。
  // これが無いと reset() 直後に下のガードが走ってステップ1へ飛ばされる
  const [isLeaving, setIsLeaving] = useState(false);

  const webGpu = useWebGpuSupport();
  const llm = useLocalLlm<Generated>();
  const save = useAsyncAction((request: CreateSelfPromotionRequest) =>
    dataClient.selfPromotions.create(request),
  );
  const isSubmitting = llm.isActive || save.isPending || isLeaving;

  const { currentStep, currentStepObject, isLastStep, handleNextStep } =
    useStepNavigation(selfPromotionSteps, paths.selfPromotionsNew);

  // 直リンク・ブラウザバック対策:
  // このステップに必要な入力が揃っていなければ先頭ステップへ戻す
  useEffect(() => {
    // 保存後は下書きをクリアするため values が空になる。
    // ここでガードしないと結果画面へ遷移する前にステップ1へ戻されてしまう。
    if (isSubmitting) return;
    if (!currentStepObject) return;
    const missing = currentStepObject.requiredParams.some(
      (key) => !values[key]?.trim(),
    );
    if (missing) {
      navigate(paths.selfPromotionsNew, { replace: true });
    }
  }, [currentStepObject, values, navigate, isSubmitting]);

  // 入力が揃ったら、ステップの代わりに生成画面を出す（保存は案を選んでから）
  const handleSubmit = () => {
    if (webGpu !== 'supported') return;
    const request = toRequest();
    if (!request) {
      navigate(paths.selfPromotionsNew, { replace: true });
      return;
    }
    save.clearError();
    llm.start(buildSelfPromotionTask(request));
  };

  const handleSave = async (generated: Generated) => {
    const request = toRequest();
    if (!request) return;

    const created = await save.run({ ...request, generated });
    // 失敗時は save.error に載っているので、ここでは何もしない
    if (!created) return;

    setIsLeaving(true);
    // navigate を先に呼ぶ。reset() を先にすると values が空になった状態で
    // 上のガードが走り、結果画面ではなくステップ1へ戻ってしまう。
    navigate(paths.selfPromotion(created.id), { replace: true });
    reset();
  };

  // useStepNavigation が先頭ステップへリダイレクトするまでの間
  if (!currentStepObject) return null;

  const StepComponent = currentStepObject.component;

  return (
    <>
      <ToolLayout
        title='自己PR作成'
        onBack={() => (llm.isActive ? llm.reset() : navigate(-1))}
        headerSlot={
          <ProgressBar
            current={llm.isActive ? selfPromotionSteps.length : currentStep}
            total={selfPromotionSteps.length}
          />
        }
      >
        {llm.isActive ? (
          <LlmGenerationPanel
            llm={llm}
            toPreview={splitTitle}
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
                  isSubmitDisabled={webGpu !== 'supported'}
                />
              </motion.div>
            </AnimatePresence>
          </>
        )}
      </ToolLayout>

      {/* 生成中・生成後も、保存せずに出ていくなら確認する。
          保存は values を持ったまま結果画面へ出るので save.isPending で除く
          （navigate の時点では isLeaving がまだ描画に反映されていない） */}
      <LeaveConfirmDialog
        when={(isDirty || llm.isActive) && !save.isPending && !isLeaving}
        keepWithin={paths.selfPromotionsNew}
      />
    </>
  );
}
