import { Button } from "~/components/Button";
import { SuggestChips } from "~/components/SuggestChips";
import { TextArea } from "~/components/TextArea";
import { SuggestMaxCount } from "~/features/SelfPromotion/constants/inputText";
import { useSelfPromotionForm } from "~/features/SelfPromotion/hooks/useSelfPromotionForm";
import type { StepComponentProps } from "~/features/ToolWizard/types";
import type { CreateSelfPromotionRequest } from "~/types/selfPromotion";

type Props = StepComponentProps & {
  name: keyof CreateSelfPromotionRequest;
  placeholder: string;
  candidates: readonly string[];
  /** 最終ステップでは「次へ」ではなく生成ボタンにする */
  submitText?: string;
};

const MAX_LENGTH = 100;

/**
 * 自由入力ステップの共通実装。
 * situation / difficulty / solution / strength-other はすべてこれを使う。
 */
export function TextInputStep({
  label,
  name,
  placeholder,
  candidates,
  handleNextStep,
  isSubmitting = false,
  submitText = "次へ",
}: Props) {
  const { values, setValue } = useSelfPromotionForm();
  const value = values[name] ?? "";
  const isEmpty = value.trim().length === 0;

  return (
    <div className="flex flex-col gap-xl">
      <h2 className="text-lg font-bold leading-md">{label}</h2>

      <div className="flex flex-col gap-md">
        <TextArea
          value={value}
          onChange={(next) => setValue(name, next)}
          placeholder={placeholder}
          maxLength={MAX_LENGTH}
          showCount
          minRows={3}
        />
        <SuggestChips
          candidates={candidates}
          maxCount={SuggestMaxCount}
          onPick={(word) => setValue(name, word)}
        />
      </div>

      <Button
        text={submitText}
        onClick={() => handleNextStep()}
        disabled={isEmpty}
        isPending={isSubmitting}
      />
    </div>
  );
}
