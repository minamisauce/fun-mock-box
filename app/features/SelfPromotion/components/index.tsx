import { ArrowLeftRight, Dumbbell, Smile, UsersRound } from 'lucide-react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router';
import {
  difficulty,
  STRENGTH_OPTIONS,
  STRENGTH_OTHER_LABEL,
  SuggestMaxCount,
  situation,
  solution,
  strength,
} from '~/features/SelfPromotion/constants/inputText';
import { StepIdEnum } from '~/features/SelfPromotion/constants/stepIds';
import { useSelfPromotionForm } from '~/features/SelfPromotion/hooks/useSelfPromotionForm';
import { SelectStep } from '~/features/ToolWizard/SelectStep';
import { TextStep } from '~/features/ToolWizard/TextStep';
import type { StepComponentProps } from '~/features/ToolWizard/types';
import { paths } from '~/lib/paths';
import { TOOL_THEME } from '~/lib/toolTheme';
import type { CreateSelfPromotionRequest } from '~/types/selfPromotion';

const theme = TOOL_THEME['self-promotion'];
const OTHER_VALUE = '__other__';

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

const strengthOptions = [
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
      // ブラウザバックで戻ったとき固定4択の値が残っていることがあるためクリアする。
      setValue('strength', '');
      navigate(paths.selfPromotionsNewStep(StepIdEnum.STRENGTH_OTHER));
      return;
    }
    setValue('strength', value);
    handleNextStep();
  };

  return (
    <SelectStep
      label={label}
      options={strengthOptions}
      onSelect={handleSelect}
      theme={theme}
    />
  );
}

/** 自由入力ステップの薄いラッパ。どのフィールドを扱うかだけが違う */
function createTextStep(
  name: keyof CreateSelfPromotionRequest,
  placeholder: string,
  candidates: readonly string[],
  nextText?: string,
) {
  return function Step({
    label,
    handleNextStep,
    isSubmitting,
  }: StepComponentProps) {
    const { values, setValue } = useSelfPromotionForm();
    return (
      <TextStep
        label={label}
        value={values[name] ?? ''}
        onChange={(next) => setValue(name, next)}
        placeholder={placeholder}
        candidates={candidates}
        suggestMaxCount={SuggestMaxCount}
        onNext={handleNextStep}
        nextText={nextText}
        isSubmitting={isSubmitting}
        theme={theme}
      />
    );
  };
}

export const SelectStrengthOther = createTextStep(
  'strength',
  '例）情報収集能力',
  strength,
);
export const SelectSituation = createTextStep(
  'situation',
  '例）音楽バンドの活動',
  situation,
);
export const SelectDifficulty = createTextStep(
  'difficulty',
  '例）メンバーとの意見の違い',
  difficulty,
);
export const SelectSolution = createTextStep(
  'solution',
  '例）部員同士の話し合い',
  solution,
  '自己PRを作成する',
);
