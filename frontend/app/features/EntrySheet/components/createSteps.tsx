import { useEffect, useState } from 'react';
import { Button } from '~/components/Button';
import { ConsentNotice } from '~/components/ConsentNotice';
import { TextField } from '~/components/TextField';
import { ImageImportFlow } from '~/features/EntrySheet/components/ImageImportFlow';
import { ImageImportEntry } from '~/features/EntrySheet/components/InputModeEntry';
import {
  ENTRY_SHEETS_CHARACTER_LIMIT_OPTIONS,
  ENTRY_SHEETS_COMPANY_NAME_MAX_LENGTH,
  ENTRY_SHEETS_COMPANY_NAME_SUGGESTIONS,
  ENTRY_SHEETS_EPISODE_MAX_LENGTH,
  ENTRY_SHEETS_QUESTION_MAX_LENGTH,
  ENTRY_SHEETS_QUESTION_OPTIONS,
  ENTRY_SHEETS_TEXT,
} from '~/features/EntrySheet/constants';
import { useEntrySheetCreateForm } from '~/features/EntrySheet/hooks/useEntrySheetCreateForm';
import { TextStep } from '~/features/ToolWizard/TextStep';
import type { StepComponentProps } from '~/features/ToolWizard/types';
import { cn } from '~/lib/cn';

/** 記入候補チップ。SuggestChips と同じ見た目に、選択中の表現だけ足す */
function LimitChip({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type='button'
      onClick={onClick}
      onMouseDown={(e) => e.preventDefault()}
      className={cn(
        'rounded-infinity border px-md py-sm text-xs transition-colors',
        selected
          ? 'border-primary bg-primary-soft text-primary'
          : 'border-border-2 text-font-gray hover:bg-gray-2 hover:text-black',
      )}
    >
      {label}
    </button>
  );
}

/**
 * 1問目。添削ウィザードと同じ「自由入力 + 記入候補チップ」。
 * 画像からの一括入力もここに添える。
 */
export function InputQuestion({
  label,
  handleNextStep,
  handleSubmit,
  isSubmitting,
  isSubmitDisabled,
}: StepComponentProps) {
  const { values, setValue } = useEntrySheetCreateForm();
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
          contentMaxLength={ENTRY_SHEETS_EPISODE_MAX_LENGTH}
          contentLabel={ENTRY_SHEETS_TEXT.episode.label}
          contentPlaceholder={ENTRY_SHEETS_TEXT.episode.placeholder}
          withCharacterLimit
          confirmLabel='ESを作成する'
          isSubmitting={isSubmitting}
          isSubmitDisabled={isSubmitDisabled}
          onConfirm={(imported) => {
            setValue('question', imported.question);
            setValue('company_name', imported.company_name);
            setValue('character_limit', imported.character_limit);
            setValue('episode', imported.content);

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
          contentLabel='エピソード'
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
  const { values, setValue } = useEntrySheetCreateForm();

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
 * 文字数は任意項目。Figma の1画面フォーム（node 3302:3952）と同じく
 * 「数値の自由入力 + 文字以内」で、よく使う値は候補チップから選べる。
 *
 * 空のまま「次へ」で指定なしになるので、ボタンは常に押せる。
 */
export function InputCharacterLimit({
  label,
  handleNextStep,
}: StepComponentProps) {
  const { values, setValue } = useEntrySheetCreateForm();
  const limit = values.character_limit ?? '';

  return (
    <div className='flex flex-col gap-xl'>
      <h2 className='text-lg font-bold leading-md'>{label}</h2>

      <div className='flex flex-col gap-md'>
        <div className='flex items-center gap-xs'>
          <TextField
            id='es-character_limit'
            className='w-28'
            value={limit}
            // 全角や記号が混ざると Number() で NaN になるので数字だけ残す
            onChange={(next) =>
              setValue('character_limit', next.replace(/[^0-9]/g, ''))
            }
            placeholder='指定しない'
            inputMode='numeric'
            maxLength={4}
          />
          <span className='text-sm leading-md'>
            {ENTRY_SHEETS_TEXT.characterLimit.suffix}
          </span>
        </div>

        <div className='flex flex-col gap-xs'>
          <span className='text-xs text-font-gray'>よく使う文字数</span>
          <div className='flex flex-wrap gap-xs'>
            {ENTRY_SHEETS_CHARACTER_LIMIT_OPTIONS.map((option) => (
              <LimitChip
                key={option}
                label={`${option}字`}
                selected={limit === option}
                onClick={() => setValue('character_limit', option)}
              />
            ))}
            <LimitChip
              label='指定しない'
              selected={limit === ''}
              onClick={() => setValue('character_limit', '')}
            />
          </div>
        </div>
      </div>

      <Button text='次へ' onClick={handleNextStep} />
    </div>
  );
}

/** 最終ステップ。生成AIへの送信に同意するまで作成ボタンを押せない */
export function InputEpisode({
  label,
  handleNextStep,
  isSubmitting,
  isSubmitDisabled,
}: StepComponentProps) {
  const { values, setValue } = useEntrySheetCreateForm();
  const [agreed, setAgreed] = useState(false);

  return (
    <TextStep
      label={label}
      value={values.episode ?? ''}
      onChange={(next) => setValue('episode', next)}
      placeholder={ENTRY_SHEETS_TEXT.episode.placeholder}
      maxLength={ENTRY_SHEETS_EPISODE_MAX_LENGTH}
      minRows={6}
      onNext={handleNextStep}
      nextText='ESを作成する'
      isSubmitting={isSubmitting}
      beforeAction={
        <ConsentNotice toolName='ES' agreed={agreed} onChange={setAgreed} />
      }
      disabled={!agreed || isSubmitDisabled}
    />
  );
}
