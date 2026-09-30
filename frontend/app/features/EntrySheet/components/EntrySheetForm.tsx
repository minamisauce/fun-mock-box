import { RotateCcw, Sparkles } from 'lucide-react';
import { type ReactNode, useCallback, useState } from 'react';
import { Button } from '~/components/Button';
import { SuggestField } from '~/components/SuggestField';
import { Tabs } from '~/components/Tabs';
import { TextArea } from '~/components/TextArea';
import { ImageFields } from '~/features/EntrySheet/components/ImageFields';
import { NoticeDisclosure } from '~/features/EntrySheet/components/NoticeDisclosure';
import {
  ENTRY_SHEETS_CHARACTER_LIMIT_OPTIONS,
  ENTRY_SHEETS_COMPANY_NAME_MAX_LENGTH,
  ENTRY_SHEETS_COMPANY_NAME_SUGGESTIONS,
  ENTRY_SHEETS_EPISODE_MAX_LENGTH,
  ENTRY_SHEETS_ORIGINAL_CONTENT_MAX_LENGTH,
  ENTRY_SHEETS_QUESTION_MAX_LENGTH,
  ENTRY_SHEETS_QUESTION_OPTIONS,
  ENTRY_SHEETS_TEXT,
} from '~/features/EntrySheet/constants';
import { useImageUpload } from '~/features/EntrySheet/hooks/useImageUpload';
import { cn } from '~/lib/cn';
import { TOOL_THEME } from '~/lib/toolTheme';
import type { EntrySheetType, ExtractedEntrySheet } from '~/types/entrySheet';

const theme = TOOL_THEME['entry-sheet'];

/**
 * タブは「どう入力するか」の1段だけ（Figma node 3302:3937 と同じ）。
 *
 * 「作成 / 添削」は Figma ではボトムタブバー＝トップレベルの行き先だった。
 * このアプリではホームのカードで入口そのものを分けているので、
 * フォーム内には切替も相互リンクも置かない。
 */
type InputMode = 'TEXT' | 'IMAGE';

const INPUT_OPTIONS = [
  { label: 'テキスト入力', value: 'TEXT' as const },
  { label: '画像で文章取り込み', value: 'IMAGE' as const },
];

export type EntrySheetFormValues = {
  question: string;
  company_name: string;
  /** 作成モードのみ */
  episode: string;
  /** 作成モードのみ。未選択は空文字 */
  character_limit: string;
  /** 添削モードのみ */
  original_content: string;
};

type Props = {
  mode: EntrySheetType;
  isSubmitting: boolean;
  onSubmit: (values: EntrySheetFormValues) => void;
};

/** 画像から自動入力された項目に付ける印 */
function AutoFilledBadge() {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-3xs rounded-infinity px-xs py-3xs text-xxs',
        theme.bgSoft,
        theme.text,
      )}
    >
      <Sparkles size={10} aria-hidden />
      画像から自動入力
    </span>
  );
}

/**
 * Figma の form-group。ラベルと入力欄の間は 4px、group 同士は 16px。
 * ラベルは htmlFor で入力欄に紐づけ、タップでフォーカスが入るようにする。
 */
function FormGroup({
  htmlFor,
  label,
  required = false,
  autoFilled = false,
  children,
}: {
  htmlFor: string;
  label: string;
  required?: boolean;
  autoFilled?: boolean;
  children: ReactNode;
}) {
  return (
    <div className='flex flex-col gap-xxs'>
      <div className='flex items-center justify-between gap-xs'>
        <label
          htmlFor={htmlFor}
          className='flex items-center gap-xxs text-sm font-bold leading-md'
        >
          {label}
          {required && (
            <span className='font-normal text-primary-red' aria-hidden>
              *
            </span>
          )}
          {required && <span className='sr-only'>（必須）</span>}
        </label>
        {autoFilled && <AutoFilledBadge />}
      </div>
      {children}
    </div>
  );
}

type ErrorKey =
  | 'question'
  | 'company_name'
  | 'episode'
  | 'original_content'
  | 'agreed';

type FieldErrors = Partial<Record<ErrorKey, string>>;

/**
 * 送信ボタンは常に押せるようにし、押した時点で不足を各欄に出す。
 * disabled は「なぜ押せないか」を説明できず、モバイルでは無反応に見えるため。
 */
function scrollToFirstError(errors: FieldErrors, order: ErrorKey[]) {
  const firstKey = order.find((key) => errors[key]);
  if (!firstKey) return;
  const el = document.getElementById(`es-${firstKey}`);
  if (!el) return;
  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  // スクロール中にフォーカスすると位置が飛ぶので少し待つ
  window.setTimeout(() => el.focus({ preventScroll: true }), 300);
}

export function EntrySheetForm({ mode, isSubmitting, onSubmit }: Props) {
  const isCreate = mode === 'CREATE';

  const [inputMode, setInputMode] = useState<InputMode>('TEXT');
  const [values, setValues] = useState<EntrySheetFormValues>({
    question: '',
    company_name: '',
    episode: '',
    character_limit: '',
    original_content: '',
  });
  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  /** 画像から自動入力された項目。手で直したら印を外す */
  const [autoFilled, setAutoFilled] = useState<
    Partial<Record<keyof EntrySheetFormValues, boolean>>
  >({});
  /** 画像タブで読み取りが済んだか。済んでいればタブ内にフォームを出す */
  const [hasExtracted, setHasExtracted] = useState(false);

  const set = <K extends keyof EntrySheetFormValues>(
    key: K,
    value: EntrySheetFormValues[K],
  ) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setAutoFilled((prev) => (prev[key] ? { ...prev, [key]: false } : prev));
    setErrors((prev) =>
      prev[key as ErrorKey] ? { ...prev, [key]: undefined } : prev,
    );
  };

  // 本文は、作成なら episode / 添削なら original_content に入れる
  const mainField = isCreate ? 'episode' : 'original_content';

  const handleExtracted = useCallback(
    (result: ExtractedEntrySheet) => {
      const filled: Partial<Record<keyof EntrySheetFormValues, boolean>> = {};
      setValues((prev) => {
        const next = { ...prev, [mainField]: result.content };
        filled[mainField] = true;
        if (result.question) {
          next.question = result.question;
          filled.question = true;
        }
        if (result.company_name) {
          next.company_name = result.company_name;
          filled.company_name = true;
        }
        return next;
      });
      setAutoFilled(filled);
      setHasExtracted(true);
    },
    [mainField],
  );

  const image = useImageUpload({ onExtracted: handleExtracted });

  const handleRestartImage = () => {
    image.removeImage();
    setHasExtracted(false);
    setAutoFilled({});
  };

  const mainText = isCreate ? values.episode : values.original_content;
  const errorOrder: ErrorKey[] = [
    'question',
    'company_name',
    mainField,
    'agreed',
  ];

  const handleSubmit = () => {
    const next: FieldErrors = {};
    if (values.question.trim() === '') {
      next.question = 'ESの質問を入力してください';
    }
    if (values.company_name.trim() === '') {
      next.company_name = '提出する企業名を入力してください';
    }
    if (mainText.trim() === '') {
      next[mainField] = isCreate
        ? '文章や必ず入れたいエピソードを入力してください'
        : '添削したいESを入力してください';
    }
    if (!agreed) {
      next.agreed = '注意事項への同意が必要です';
    }

    setErrors(next);
    if (Object.keys(next).length > 0) {
      scrollToFirstError(next, errorOrder);
      return;
    }
    onSubmit(values);
  };

  /** テキスト入力タブと、画像から読み取ったあとの両方で使う入力欄一式 */
  const fields = (
    <div className='flex flex-col gap-md'>
      <FormGroup
        htmlFor='es-question'
        label={ENTRY_SHEETS_TEXT.question.label}
        required
        autoFilled={autoFilled.question}
      >
        <SuggestField
          id='es-question'
          value={values.question}
          onChange={(v) => set('question', v)}
          options={ENTRY_SHEETS_QUESTION_OPTIONS}
          placeholder={ENTRY_SHEETS_TEXT.question.placeholder}
          maxLength={ENTRY_SHEETS_QUESTION_MAX_LENGTH}
          errorMessage={errors.question}
        />
      </FormGroup>

      <FormGroup
        htmlFor='es-company_name'
        label={ENTRY_SHEETS_TEXT.companyName.label}
        required
        autoFilled={autoFilled.company_name}
      >
        <SuggestField
          id='es-company_name'
          value={values.company_name}
          onChange={(v) => set('company_name', v)}
          options={ENTRY_SHEETS_COMPANY_NAME_SUGGESTIONS}
          placeholder={ENTRY_SHEETS_TEXT.companyName.placeholder}
          maxLength={ENTRY_SHEETS_COMPANY_NAME_MAX_LENGTH}
          errorMessage={errors.company_name}
        />
      </FormGroup>

      {isCreate && (
        <FormGroup
          htmlFor='es-character_limit'
          label={ENTRY_SHEETS_TEXT.characterLimit.label}
        >
          <div className='flex items-center gap-xs'>
            <SuggestField
              id='es-character_limit'
              className='w-28'
              value={values.character_limit}
              onChange={(v) => set('character_limit', v.replace(/[^0-9]/g, ''))}
              options={ENTRY_SHEETS_CHARACTER_LIMIT_OPTIONS}
              placeholder={ENTRY_SHEETS_TEXT.characterLimit.placeholder}
              inputMode='numeric'
              maxLength={4}
            />
            <span className='text-sm leading-md'>
              {ENTRY_SHEETS_TEXT.characterLimit.suffix}
            </span>
          </div>
        </FormGroup>
      )}

      <FormGroup
        htmlFor={`es-${mainField}`}
        label={
          isCreate
            ? ENTRY_SHEETS_TEXT.episode.label
            : ENTRY_SHEETS_TEXT.originalContent.label
        }
        required
        autoFilled={autoFilled[mainField]}
      >
        <TextArea
          id={`es-${mainField}`}
          value={mainText}
          onChange={(v) => set(mainField, v)}
          placeholder={
            isCreate
              ? ENTRY_SHEETS_TEXT.episode.placeholder
              : ENTRY_SHEETS_TEXT.originalContent.placeholder
          }
          maxLength={
            isCreate
              ? ENTRY_SHEETS_EPISODE_MAX_LENGTH
              : ENTRY_SHEETS_ORIGINAL_CONTENT_MAX_LENGTH
          }
          showCount
          minRows={6}
          errorMessage={errors[mainField]}
        />
      </FormGroup>
    </div>
  );

  const submitArea = (
    <>
      <NoticeDisclosure
        agreed={agreed}
        onChange={(next) => {
          setAgreed(next);
          setErrors((prev) => ({ ...prev, agreed: undefined }));
        }}
        errorMessage={errors.agreed}
      />
      <Button
        text={isCreate ? '作成' : '添削'}
        theme={theme}
        onClick={handleSubmit}
        disabled={image.isExtracting}
        isPending={isSubmitting}
      />
    </>
  );

  return (
    // Figma はブロック間を 16px で統一している
    <div className='flex flex-col gap-md'>
      <Tabs options={INPUT_OPTIONS} value={inputMode} onChange={setInputMode} />

      {inputMode === 'TEXT' ? (
        <>
          {fields}
          {submitArea}
        </>
      ) : hasExtracted ? (
        <>
          <Button
            text='最初からやり直す'
            variant='outline'
            theme={theme}
            beforeIcon={<RotateCcw size={16} aria-hidden />}
            onClick={handleRestartImage}
          />
          {fields}
          {submitArea}
        </>
      ) : (
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
      )}
    </div>
  );
}
