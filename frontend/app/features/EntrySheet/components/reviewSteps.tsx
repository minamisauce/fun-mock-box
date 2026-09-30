import { ImageUp } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '~/components/Button';
import { ImageFields } from '~/features/EntrySheet/components/ImageFields';
import {
  ENTRY_SHEETS_COMPANY_NAME_MAX_LENGTH,
  ENTRY_SHEETS_COMPANY_NAME_SUGGESTIONS,
  ENTRY_SHEETS_ORIGINAL_CONTENT_MAX_LENGTH,
  ENTRY_SHEETS_QUESTION_MAX_LENGTH,
  ENTRY_SHEETS_QUESTION_OPTIONS,
  ENTRY_SHEETS_TEXT,
} from '~/features/EntrySheet/constants';
import { ReviewStepIdEnum } from '~/features/EntrySheet/constants/stepIds';
import { useEntrySheetReviewForm } from '~/features/EntrySheet/hooks/useEntrySheetReviewForm';
import { useImageUpload } from '~/features/EntrySheet/hooks/useImageUpload';
import { TextStep } from '~/features/ToolWizard/TextStep';
import type { StepComponentProps } from '~/features/ToolWizard/types';
import { paths } from '~/lib/paths';
import { TOOL_THEME } from '~/lib/toolTheme';

const theme = TOOL_THEME['entry-sheet'];

/**
 * 1問目。企業名ステップと同じ「自由入力 + 記入候補チップ」。
 *
 * 画像からの一括入力もここに置く。1画面フォームではタブだったが、
 * ウィザードにタブの居場所が無いので最初のステップに添える。
 */
export function InputQuestion({ label, handleNextStep }: StepComponentProps) {
  const { values, setValue } = useEntrySheetReviewForm();
  const navigate = useNavigate();
  const [isImageMode, setIsImageMode] = useState(false);

  const image = useImageUpload({
    onExtracted: (result) => {
      setValue('original_content', result.content);
      if (result.question) setValue('question', result.question);
      if (result.company_name) setValue('company_name', result.company_name);

      // 読み取れなかった項目があるステップより先へは進めない
      // （進めても requiredParams のガードで先頭へ戻される）
      if (!result.question) {
        setIsImageMode(false);
        return;
      }
      navigate(
        paths.entrySheetsReviewNewStep(
          result.company_name
            ? ReviewStepIdEnum.CONTENT
            : ReviewStepIdEnum.COMPANY_NAME,
        ),
      );
    },
  });

  if (isImageMode) {
    return (
      <div className='flex flex-col gap-xl'>
        <h2 className='text-lg font-bold leading-md'>ESの画像から一括入力</h2>
        <ImageFields
          preview={image.preview}
          fileName={image.fileName}
          error={image.error}
          isExtracting={image.isExtracting}
          fileInputRef={image.fileInputRef}
          cameraInputRef={image.cameraInputRef}
          onSelectFile={image.selectFile}
          onCaptureCamera={image.captureCamera}
          onFileChange={image.handleFile}
          onRemove={image.removeImage}
        />
        <Button
          text='手で入力する'
          variant='outline'
          theme={theme}
          onClick={() => {
            image.removeImage();
            setIsImageMode(false);
          }}
          disabled={image.isExtracting}
        />
      </div>
    );
  }

  return (
    <div className='flex flex-col gap-xl'>
      <TextStep
        label={label}
        value={values.question ?? ''}
        onChange={(next) => setValue('question', next)}
        placeholder={ENTRY_SHEETS_TEXT.question.placeholder}
        candidates={ENTRY_SHEETS_QUESTION_OPTIONS}
        suggestMaxCount={ENTRY_SHEETS_QUESTION_OPTIONS.length}
        maxLength={ENTRY_SHEETS_QUESTION_MAX_LENGTH}
        onNext={handleNextStep}
        theme={theme}
      />
      <Button
        text='ESの画像から一括入力'
        variant='outline'
        theme={theme}
        beforeIcon={<ImageUp size={16} aria-hidden />}
        onClick={() => setIsImageMode(true)}
      />
    </div>
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
      theme={theme}
    />
  );
}

/**
 * 最終ステップ。自己PR・志望動機の最終ステップと同じ素の TextStep。
 * 注意事項への同意は取らない（他2ツールのウィザードも取っていない）。
 */
export function InputContent({
  label,
  handleNextStep,
  isSubmitting,
}: StepComponentProps) {
  const { values, setValue } = useEntrySheetReviewForm();

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
      theme={theme}
    />
  );
}
