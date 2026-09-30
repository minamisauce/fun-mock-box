import { createToolForm } from '~/features/ToolWizard/createToolForm';
import { STORAGE_KEYS } from '~/lib/storage';
import type { ReviewEntrySheetRequest } from '~/types/entrySheet';

export const {
  Provider: EntrySheetReviewFormProvider,
  useToolForm: useEntrySheetReviewForm,
} = createToolForm<ReviewEntrySheetRequest>({
  storageKey: STORAGE_KEYS.entrySheetReviewDraft,
  requiredKeys: ['question', 'company_name', 'original_content'],
  displayName: 'useEntrySheetReviewForm',
});
