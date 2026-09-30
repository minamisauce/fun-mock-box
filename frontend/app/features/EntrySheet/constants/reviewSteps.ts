import {
  InputCompanyName,
  InputContent,
  InputQuestion,
} from '~/features/EntrySheet/components/reviewSteps';
import { ReviewStepIdEnum } from '~/features/EntrySheet/constants/stepIds';
import type { Steps } from '~/features/ToolWizard/types';
import type { ReviewEntrySheetRequest } from '~/types/entrySheet';

/**
 * ES添削のステップ定義。
 *
 * 入力する項目は1画面フォーム版と同じ（質問 / 企業名 / 添削したいES）。
 * 3ステップとも自由入力 + 記入候補なので、分岐ステップは持たない。
 */
export const entrySheetReviewSteps: Steps<ReviewEntrySheetRequest> = [
  {
    id: ReviewStepIdEnum.QUESTION,
    component: InputQuestion,
    label: 'ESの質問を教えてください',
    requiredParams: [],
  },
  {
    id: ReviewStepIdEnum.COMPANY_NAME,
    component: InputCompanyName,
    label: '提出する企業名を教えてください',
    requiredParams: ['question'],
  },
  {
    id: ReviewStepIdEnum.CONTENT,
    component: InputContent,
    label: '添削したいESを入力してください',
    requiredParams: ['question', 'company_name'],
  },
];
