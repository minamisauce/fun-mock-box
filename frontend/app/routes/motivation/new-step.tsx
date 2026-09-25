import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { GeneratingOverlay } from '~/components/GeneratingOverlay';
import { ProgressBar } from '~/components/ProgressBar';
import { ToolLayout } from '~/components/ToolLayout';
import { motivationSteps } from '~/features/Motivation/constants/steps';
import { useMotivationForm } from '~/features/Motivation/hooks/useMotivationForm';
import { useStepNavigation } from '~/features/ToolWizard/useStepNavigation';
import { paths } from '~/lib/paths';
import { TOOL_THEME } from '~/lib/toolTheme';
import { createMotivation } from '~/mocks/motivation';

const GENERATING_MESSAGES = [
  '回答を分析しています…',
  '構成を組み立てています…',
  '文章を作成しています…',
] as const;

const theme = TOOL_THEME.motivation;

export function meta() {
  return [{ title: '志望動機作成 | fun-mock-box' }];
}

export default function MotivationNewStep() {
  const navigate = useNavigate();
  const { values, toRequest, reset } = useMotivationForm();
  const [isSubmitting, setIsSubmitting] = useState(false);

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

    setIsSubmitting(true);
    try {
      const created = await createMotivation(request);
      // navigate を先に呼ぶ。reset() を先にすると values が空になった状態で
      // 上のガードが走り、結果画面ではなくステップ1へ戻ってしまう。
      navigate(paths.motivation(created.id), { replace: true });
      reset();
    } catch (error) {
      console.error(error);
      setIsSubmitting(false);
    }
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
          <ProgressBar
            current={currentStep}
            total={motivationSteps.length}
            theme={theme}
          />
        }
      >
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
