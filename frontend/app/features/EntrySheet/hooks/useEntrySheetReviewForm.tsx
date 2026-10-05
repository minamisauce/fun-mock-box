import { createToolForm } from '~/features/ToolWizard/createToolForm';
import { STORAGE_KEYS } from '~/lib/storage';
import type { ReviewEntrySheetRequest } from '~/types/entrySheet';

/**
 * ウィザードの入力値。createToolForm は値をすべて文字列で扱うので、
 * 生成結果（generated）はフォームに持たず、保存時にリクエストへ足す。
 */
export type EntrySheetReviewFormValues = Omit<
  ReviewEntrySheetRequest,
  'generated'
>;

export const {
  Provider: EntrySheetReviewFormProvider,
  useToolForm: useEntrySheetReviewForm,
} = createToolForm<EntrySheetReviewFormValues>({
  storageKey: STORAGE_KEYS.entrySheetReviewDraft,
  requiredKeys: ['question', 'company_name', 'original_content'],
  displayName: 'useEntrySheetReviewForm',
});
