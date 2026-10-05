import { createToolForm } from '~/features/ToolWizard/createToolForm';
import { STORAGE_KEYS } from '~/lib/storage';
import type { CreateMotivationRequest } from '~/types/motivation';

/**
 * ウィザードの入力値。createToolForm は値をすべて文字列で扱うので、
 * 生成結果（generated）はフォームに持たず、保存時にリクエストへ足す。
 */
export type MotivationFormValues = Omit<CreateMotivationRequest, 'generated'>;

export const {
  Provider: MotivationFormProvider,
  useToolForm: useMotivationForm,
} = createToolForm<MotivationFormValues>({
  storageKey: STORAGE_KEYS.motivationDraft,
  requiredKeys: ['industry', 'sector', 'reason', 'experience'],
  displayName: 'useMotivationForm',
});
