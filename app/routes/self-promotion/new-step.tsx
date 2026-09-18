import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { GeneratingOverlay } from "~/components/GeneratingOverlay";
import { ProgressBar } from "~/components/ProgressBar";
import { ToolLayout } from "~/components/ToolLayout";
import { selfPromotionSteps } from "~/features/SelfPromotion/constants/steps";
import { useSelfPromotionForm } from "~/features/SelfPromotion/hooks/useSelfPromotionForm";
import { useStepNavigation } from "~/features/ToolWizard/useStepNavigation";
import { paths } from "~/lib/paths";
import { createSelfPromotion } from "~/mocks/selfPromotion";

const GENERATING_MESSAGES = [
  "回答を分析しています…",
  "構成を組み立てています…",
  "文章を作成しています…",
] as const;

export function meta() {
  return [{ title: "自己PR作成 | fun-mock-box" }];
}

export default function SelfPromotionNewStep() {
  const navigate = useNavigate();
  const { values, toRequest, reset } = useSelfPromotionForm();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { currentStep, currentStepObject, isLastStep, handleNextStep } =
    useStepNavigation(selfPromotionSteps, paths.selfPromotionsNew);

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
      navigate(paths.selfPromotionsNew, { replace: true });
    }
  }, [currentStepObject, values, navigate, isSubmitting]);

  const handleSubmit = async () => {
    const request = toRequest();
    if (!request) {
      navigate(paths.selfPromotionsNew, { replace: true });
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await createSelfPromotion(request);
      // navigate を先に呼ぶ。reset() を先にすると values が空になった状態で
      // 上のガードが走り、結果画面ではなくステップ1へ戻ってしまう。
      navigate(paths.selfPromotion(created.id), { replace: true });
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
        title="自己PR作成"
        onBack={() => navigate(-1)}
        headerSlot={
          <ProgressBar
            current={currentStep}
            total={selfPromotionSteps.length}
          />
        }
      >
        <AnimatePresence mode="wait">
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
      />
    </>
  );
}
