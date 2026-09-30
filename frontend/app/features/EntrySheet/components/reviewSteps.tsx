import { useEffect, useState } from 'react';
import { ConsentNotice } from '~/components/ConsentNotice';
import { ImageImportFlow } from '~/features/EntrySheet/components/ImageImportFlow';
import { ImageImportEntry } from '~/features/EntrySheet/components/InputModeEntry';
import {
  ENTRY_SHEETS_COMPANY_NAME_MAX_LENGTH,
  ENTRY_SHEETS_COMPANY_NAME_SUGGESTIONS,
  ENTRY_SHEETS_ORIGINAL_CONTENT_MAX_LENGTH,
  ENTRY_SHEETS_QUESTION_MAX_LENGTH,
  ENTRY_SHEETS_QUESTION_OPTIONS,
  ENTRY_SHEETS_TEXT,
} from '~/features/EntrySheet/constants';
import { useEntrySheetReviewForm } from '~/features/EntrySheet/hooks/useEntrySheetReviewForm';
import { TextStep } from '~/features/ToolWizard/TextStep';
import type { StepComponentProps } from '~/features/ToolWizard/types';

/**
 * 1問目。企業名ステップと同じ「自由入力 + 記入候補チップ」。
 *
 * 画像からの一括入力もここに置く。1画面フォームではタブだったが、
 * ウィザードにタブの居場所が無いので最初のステップに添える。
 */
export function InputQuestion({
  label,
  handleNextStep,
  handleSubmit,
  isSubmitting,
}: StepComponentProps) {
  const { values, setValue } = useEntrySheetReviewForm();
  const [isImageMode, setIsImageMode] = useState(false);
  // 画像から確定したことを次のレンダーへ持ち越すフラグ。
  // setValue は同じイベントの中では反映されないので、その場で handleSubmit を
  // 呼ぶと更新前の値で送信されてしまう
  const [readyToSubmit, setReadyToSubmit] = useState(false);

  useEffect(() => {
    if (!readyToSubmit) return;
    setReadyToSubmit(false);
    handleSubmit?.();
  }, [readyToSubmit, handleSubmit]);

  if (isImageMode) {
    return (
      <div className='flex flex-col gap-xl'>
        <h2 className='text-lg font-bold leading-md'>画像から一括入力</h2>
        <ImageImportFlow
          contentMaxLength={ENTRY_SHEETS_ORIGINAL_CONTENT_MAX_LENGTH}
          contentLabel={ENTRY_SHEETS_TEXT.originalContent.label}
          contentPlaceholder={ENTRY_SHEETS_TEXT.originalContent.placeholder}
          confirmLabel='ESを添削する'
          isSubmitting={isSubmitting}
          onConfirm={(imported) => {
            setValue('question', imported.question);
            setValue('company_name', imported.company_name);
            setValue('original_content', imported.content);

            // この画面で全項目が揃うので、残りのステップは踏まずに送信する
            setReadyToSubmit(true);
          }}
          onCancel={() => setIsImageMode(false)}
        />
      </div>
    );
  }

  return (
    <TextStep
      label={label}
      value={values.question ?? ''}
      onChange={(next) => setValue('question', next)}
      placeholder={ENTRY_SHEETS_TEXT.question.placeholder}
      candidates={ENTRY_SHEETS_QUESTION_OPTIONS}
      suggestMaxCount={ENTRY_SHEETS_QUESTION_OPTIONS.length}
      maxLength={ENTRY_SHEETS_QUESTION_MAX_LENGTH}
      onNext={handleNextStep}
      beforeAction={
        <ImageImportEntry
          contentLabel='本文'
          onClick={() => setIsImageMode(true)}
        />
      }
    />
  );
}

export function InputCompanyName({
  label,
  handleNextStep,
}: StepComponentProps) {
  const { values, setValue } = useEntrySheetReviewForm();

  return (
    <TextStep
      label={label}
      value={values.company_name ?? ''}
      onChange={(next) => setValue('company_name', next)}
      placeholder='例）株式会社サンプル'
      candidates={ENTRY_SHEETS_COMPANY_NAME_SUGGESTIONS}
      suggestMaxCount={ENTRY_SHEETS_COMPANY_NAME_SUGGESTIONS.length}
      maxLength={ENTRY_SHEETS_COMPANY_NAME_MAX_LENGTH}
      onNext={handleNextStep}
    />
  );
}

/**
 * 最終ステップ。自己PR・志望動機と同じく、生成AIへの送信に同意するまで
 * 添削ボタンを押せない。Figma: 自己PRツール node 3578:22404
 */
export function InputContent({
  label,
  handleNextStep,
  isSubmitting,
}: StepComponentProps) {
  const { values, setValue } = useEntrySheetReviewForm();
  const [agreed, setAgreed] = useState(false);

  return (
    <TextStep
      label={label}
      value={values.original_content ?? ''}
      onChange={(next) => setValue('original_content', next)}
      placeholder={ENTRY_SHEETS_TEXT.originalContent.placeholder}
      maxLength={ENTRY_SHEETS_ORIGINAL_CONTENT_MAX_LENGTH}
      minRows={10}
      onNext={handleNextStep}
      nextText='ESを添削する'
      isSubmitting={isSubmitting}
      beforeAction={
        <ConsentNotice toolName='ES' agreed={agreed} onChange={setAgreed} />
      }
      disabled={!agreed}
    />
  );
}
