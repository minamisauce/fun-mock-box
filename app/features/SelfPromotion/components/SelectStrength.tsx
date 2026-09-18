import { ArrowLeftRight, Dumbbell, Smile, UsersRound } from "lucide-react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router";
import { SelectCard } from "~/components/SelectCard";
import {
  STRENGTH_OPTIONS,
  STRENGTH_OTHER_LABEL,
} from "~/features/SelfPromotion/constants/inputText";
import { StepIdEnum } from "~/features/SelfPromotion/constants/stepIds";
import { useSelfPromotionForm } from "~/features/SelfPromotion/hooks/useSelfPromotionForm";
import type { StepComponentProps } from "~/features/ToolWizard/types";
import { paths } from "~/lib/paths";

const OTHER_VALUE = "__other__";

/**
 * Design System の glayButton はアイコン 24px を持つ。
 * shukatsu-box 本番のアイコン（People2 / Arrow2 / Dumbbell / Face）に
 * 対応する lucide-react のグリフを当てている。
 */
const STRENGTH_ICON: Record<string, ReactNode> = {
  問題解決力: <UsersRound size={24} aria-hidden />,
  柔軟性: <ArrowLeftRight size={24} aria-hidden />,
  継続力: <Dumbbell size={24} aria-hidden />,
};

const options = [
  ...STRENGTH_OPTIONS.map((label) => ({
    label,
    value: label,
    icon: STRENGTH_ICON[label],
  })),
  {
    label: STRENGTH_OTHER_LABEL,
    value: OTHER_VALUE,
    icon: <Smile size={24} aria-hidden />,
  },
];

export function SelectStrength({ label, handleNextStep }: StepComponentProps) {
  const { setValue } = useSelfPromotionForm();
  const navigate = useNavigate();

  const handleSelect = (value: string) => {
    if (value === OTHER_VALUE) {
      // strength-other は strength と同じ階層の分岐ステップなので
      // handleNextStep では到達できない。直接遷移させる。
      // ブラウザバックで戻ってきたときに固定4択の値が残っていることがあるためクリアする。
      setValue("strength", "");
      navigate(paths.selfPromotionsNewStep(StepIdEnum.STRENGTH_OTHER));
      return;
    }
    setValue("strength", value);
    handleNextStep();
  };

  return (
    <div className="flex flex-col gap-xl">
      <h2 className="text-lg font-bold leading-md">{label}</h2>
      <SelectCard options={options} onSelect={handleSelect} columns={2} />
    </div>
  );
}
