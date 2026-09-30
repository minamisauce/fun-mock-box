import { createToolForm } from '~/features/ToolWizard/createToolForm';
import { STORAGE_KEYS } from '~/lib/storage';

/**
 * ES作成ウィザードの入力値。
 *
 * CreateEntrySheetRequest をそのまま使えないのは character_limit が number のため。
 * createToolForm は値をすべて文字列で扱うので、ここでは文字列で持ち、
 * 送信時に number へ変換する（空文字 = 指定しない）。
 */
export type EntrySheetCreateFormValues = {
  question: string;
  company_name: string;
  character_limit: string;
  episode: string;
};

export const {
  Provider: EntrySheetCreateFormProvider,
  useToolForm: useEntrySheetCreateForm,
} = createToolForm<EntrySheetCreateFormValues>({
  storageKey: STORAGE_KEYS.entrySheetCreateDraft,
  // character_limit は任意なので必須キーに入れない。
  // toRequest() は必須キーしか返さないため、送信側で values から読む。
  requiredKeys: ['question', 'company_name', 'episode'],
  displayName: 'useEntrySheetCreateForm',
});
