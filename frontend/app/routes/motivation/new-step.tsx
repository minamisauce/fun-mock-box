import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { ErrorNotice } from '~/components/ErrorNotice';
import { GeneratingOverlay } from '~/components/GeneratingOverlay';
import { ProgressBar } from '~/components/ProgressBar';
import { ToolLayout } from '~/components/ToolLayout';
import { dataClient } from '~/data';
import { motivationSteps } from '~/features/Motivation/constants/steps';
import { useMotivationForm } from '~/features/Motivation/hooks/useMotivationForm';
import { useStepNavigation } from '~/features/ToolWizard/useStepNavigation';
import { useAsyncAction } from '~/hooks/useAsyncAction';
import { GENERATING_MIN_DURATION_MS, withMinimumDuration } from '~/lib/delay';
import { paths } from '~/lib/paths';
import type { CreateMotivationRequest } from '~/types/motivation';

const GENERATING_MESSAGES = [
  '回答を分析しています…',
  '構成を組み立てています…',
  '文章を作成しています…',
] as const;

export function meta() {
  return [{ title: '志望動機作成 | fun-mock-box' }];
}

export default function MotivationNewStep() {
  const navigate = useNavigate();
  const { values, toRequest, reset } = useMotivationForm();
  // 生成成功後、結果画面へ移り終えるまでの状態。
  // isPending は生成が解決した時点で false に戻るので、これが無いと
  // reset() 直後に下のガードが走ってステップ1へ飛ばされる
  const [isLeaving, setIsLeaving] = useState(false);

  const create = useAsyncAction((request: CreateMotivationRequest) =>
    withMinimumDuration(
      dataClient.motivations.create(request),
      GENERATING_MIN_DURATION_MS,
    ),
  );
  const isSubmitting = create.isPending || isLeaving;

  const { currentStep, currentStepObject, isLastStep, handleNextStep } =
    useStepNavigation(motivationSteps, paths.motivationsNew);

  // 直リンク・ブラウザバック対策:
  // このステップに必要な入力が揃っていなければ先頭ステップへ戻す
  useEffect(() => {
    // 送信中は下書きをクリアするため values が空になる。
    // ここでガードしないと結果画面へ遷移する前にステップ1へ戻されてしまう。
    if (isSubmitting) return;
    if (!currentStepObject) return;
    const missing = currentStepObject.requiredParams.some(
      (key) => !values[key]?.trim(),
    );
    if (missing) {
      navigate(paths.motivationsNew, { replace: true });
    }
  }, [currentStepObject, values, navigate, isSubmitting]);

  const handleSubmit = async () => {
    const request = toRequest();
    if (!request) {
      navigate(paths.motivationsNew, { replace: true });
      return;
    }

    const created = await create.run(request);
    // 失敗時は create.error に載っているので、ここでは何もしない
    if (!created) return;

    setIsLeaving(true);
    // navigate を先に呼ぶ。reset() を先にすると values が空になった状態で
    // 上のガードが走り、結果画面ではなくステップ1へ戻ってしまう。
    navigate(paths.motivation(created.id), { replace: true });
    reset();
  };

  // useStepNavigation が先頭ステップへリダイレクトするまでの間
  if (!currentStepObject) return null;

  const StepComponent = currentStepObject.component;

  return (
    <>
      <ToolLayout
        title='志望動機作成'
        onBack={() => navigate(-1)}
        headerSlot={
          <ProgressBar current={currentStep} total={motivationSteps.length} />
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
              isSubmitting={isSubmitting}
            />
          </motion.div>
        </AnimatePresence>
      </ToolLayout>

      <GeneratingOverlay isOpen={isSubmitting} messages={GENERATING_MESSAGES} />
    </>
  );
}
