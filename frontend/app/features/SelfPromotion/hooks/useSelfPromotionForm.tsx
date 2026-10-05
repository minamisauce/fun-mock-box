import { createToolForm } from '~/features/ToolWizard/createToolForm';
import { STORAGE_KEYS } from '~/lib/storage';
import type { CreateSelfPromotionRequest } from '~/types/selfPromotion';

/**
 * ウィザードの入力値。createToolForm は値をすべて文字列で扱うので、
 * 生成結果（generated）はフォームに持たず、保存時にリクエストへ足す。
 */
export type SelfPromotionFormValues = Omit<
  CreateSelfPromotionRequest,
  'generated'
>;

export const {
  Provider: SelfPromotionFormProvider,
  useToolForm: useSelfPromotionForm,
} = createToolForm<SelfPromotionFormValues>({
  storageKey: STORAGE_KEYS.selfPromotionDraft,
  requiredKeys: ['strength', 'situation', 'difficulty', 'solution'],
  displayName: 'useSelfPromotionForm',
});
