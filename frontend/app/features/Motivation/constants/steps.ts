import {
  SelectExperience,
  SelectIndustry,
  SelectReason,
  SelectSector,
} from '~/features/Motivation/components';
import { StepIdEnum } from '~/features/Motivation/constants/stepIds';
import type { MotivationFormValues } from '~/features/Motivation/hooks/useMotivationForm';
import type { Steps } from '~/features/ToolWizard/types';

/**
 * ステップ定義。
 * 出典: shukatsu-box/frontend/app/src/features/Motivation/constants/steps.ts
 *
 * 自己PRと違い分岐ステップは無いので、すべてフラットな配列。
 */
export const motivationSteps: Steps<MotivationFormValues> = [
  {
    id: StepIdEnum.INDUSTRY,
    component: SelectIndustry,
    label: '志望業界をお選びください',
    requiredParams: [],
  },
  {
    id: StepIdEnum.SECTOR,
    component: SelectSector,
    label: '志望業種をお選びください',
    requiredParams: ['industry'],
  },
  {
    id: StepIdEnum.REASON,
    component: SelectReason,
    label: '志望する企業の魅力的な部分は何ですか？',
    requiredParams: ['industry', 'sector'],
  },
  {
    id: StepIdEnum.EXPERIENCE,
    component: SelectExperience,
    label: 'どんな経験から志望企業で働きたいと思いましたか？',
    requiredParams: ['industry', 'sector', 'reason'],
  },
];
