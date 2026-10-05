import {
  SelectDifficulty,
  SelectSituation,
  SelectSolution,
  SelectStrength,
  SelectStrengthOther,
} from '~/features/SelfPromotion/components';
import { StepIdEnum } from '~/features/SelfPromotion/constants/stepIds';
import type { SelfPromotionFormValues } from '~/features/SelfPromotion/hooks/useSelfPromotionForm';
import type { Steps } from '~/features/ToolWizard/types';

/**
 * ステップ定義。
 * 出典: shukatsu-box/frontend/app/src/features/SelfPromotion/constants/steps.ts
 */
export const selfPromotionSteps: Steps<SelfPromotionFormValues> = [
  // ネストした配列 = 同一階層の分岐ステップ
  [
    {
      id: StepIdEnum.STRENGTH,
      component: SelectStrength,
      label: 'あなたの長所を教えてください',
      requiredParams: [],
    },
    {
      id: StepIdEnum.STRENGTH_OTHER,
      component: SelectStrengthOther,
      label: 'あなたの長所を教えてください',
      requiredParams: [],
    },
  ],
  {
    id: StepIdEnum.SITUATION,
    component: SelectSituation,
    label: 'どんなときに長所を発揮しましたか？',
    requiredParams: ['strength'],
  },
  {
    id: StepIdEnum.DIFFICULTY,
    component: SelectDifficulty,
    label: '長所を発揮した経験で大変だったことは何ですか？',
    requiredParams: ['strength', 'situation'],
  },
  {
    id: StepIdEnum.SOLUTION,
    component: SelectSolution,
    label: '大変だったことを解決するために何をしましたか？',
    requiredParams: ['strength', 'situation', 'difficulty'],
  },
];
