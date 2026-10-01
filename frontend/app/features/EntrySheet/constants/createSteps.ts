import {
  InputCharacterLimit,
  InputCompanyName,
  InputEpisode,
  InputQuestion,
} from '~/features/EntrySheet/components/createSteps';
import { CreateStepIdEnum } from '~/features/EntrySheet/constants/stepIds';
import type { EntrySheetCreateFormValues } from '~/features/EntrySheet/hooks/useEntrySheetCreateForm';
import type { Steps } from '~/features/ToolWizard/types';

/**
 * ES作成のステップ定義。
 * 入力する項目は1画面フォーム版と同じ（質問 / 企業名 / 文字数 / エピソード）。
 */
export const entrySheetCreateSteps: Steps<EntrySheetCreateFormValues> = [
  {
    id: CreateStepIdEnum.QUESTION,
    component: InputQuestion,
    label: 'ESの質問を教えてください',
    requiredParams: [],
  },
  {
    id: CreateStepIdEnum.COMPANY_NAME,
    component: InputCompanyName,
    label: '提出する企業名を教えてください',
    requiredParams: ['question'],
  },
  {
    id: CreateStepIdEnum.CHARACTER_LIMIT,
    component: InputCharacterLimit,
    label: '作成する文字数を教えてください',
    requiredParams: ['question', 'company_name'],
  },
  {
    id: CreateStepIdEnum.EPISODE,
    component: InputEpisode,
    label: '文章や必ず入れたいエピソードを教えてください',
    // character_limit は任意なのでガードに含めない
    requiredParams: ['question', 'company_name'],
  },
];
