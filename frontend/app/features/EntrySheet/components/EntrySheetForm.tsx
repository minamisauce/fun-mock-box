import { ImageUp, Sparkles } from 'lucide-react';
import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '~/components/Button';
import { Tabs } from '~/components/Tabs';
import { TextArea } from '~/components/TextArea';
import { TextField } from '~/components/TextField';
import { ImageFields } from '~/features/EntrySheet/components/ImageFields';
import {
  ENTRY_SHEETS_CHARACTER_LIMIT_OPTIONS,
  ENTRY_SHEETS_COMPANY_NAME_MAX_LENGTH,
  ENTRY_SHEETS_COMPANY_NAME_SUGGESTIONS,
  ENTRY_SHEETS_EPISODE_MAX_LENGTH,
  ENTRY_SHEETS_NOTICES,
  ENTRY_SHEETS_ORIGINAL_CONTENT_MAX_LENGTH,
  ENTRY_SHEETS_QUESTION_MAX_LENGTH,
  ENTRY_SHEETS_QUESTION_OPTIONS,
} from '~/features/EntrySheet/constants';
import { useImageUpload } from '~/features/EntrySheet/hooks/useImageUpload';
import { cn } from '~/lib/cn';
import { paths } from '~/lib/paths';
import { TOOL_THEME } from '~/lib/toolTheme';
import type { EntrySheetType, ExtractedEntrySheet } from '~/types/entrySheet';

const theme = TOOL_THEME['entry-sheet'];

const MODE_OPTIONS = [
  { label: 'AIで作成', value: 'CREATE' as const },
  { label: 'AIで添削', value: 'REVIEW' as const },
];

/**
 * ES の画像には設問・企業名も写っていることが多いので、画像取り込みは
 * 「本文欄を埋める手段」ではなく「フォーム全体の下書きを作る前工程」。
 * よってフォーム冒頭に置く。
 *
 * タブ（排他）にはしない。画像で下書きを入れたあとも必ずテキスト欄で
 * 確認・修正するため、テキスト入力と画像取り込みは排他ではない。
 */

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

/** 選択肢をタップして入力欄に流し込むチップ列 */
function OptionChips({
  options,
  onPick,
}: {
  options: readonly string[];
  onPick: (value: string) => void;
}) {
  return (
    <div className='flex flex-wrap gap-xs'>
      {options.map((option) => (
        <button
          key={option}
          type='button'
          onClick={() => onPick(option)}
          onMouseDown={(e) => e.preventDefault()}
          className='rounded-infinity border border-border-2 px-md py-sm text-xs text-font-gray transition-colors hover:bg-gray-2 hover:text-black'
        >
          {option}
        </button>
      ))}
    </div>
  );
}

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

/** 必須ラベル + 自動入力バッジ */
function FieldLabel({
  label,
  autoFilled,
}: {
  label: string;
  autoFilled?: boolean;
}) {
  return (
    <div className='flex items-center justify-between'>
      <div className='flex items-center gap-xxs'>
        <span className='text-sm font-bold leading-md'>{label}</span>
        <span className='text-sm text-primary-red'>*</span>
      </div>
      {autoFilled && <AutoFilledBadge />}
    </div>
  );
}

/** フォーム冒頭の画像取り込み導線（閉じているとき） */
function ImageImportToggle({ onOpen }: { onOpen: () => void }) {
  return (
    <button
      type='button'
      onClick={onOpen}
      className={cn(
        'flex w-full flex-col items-center gap-3xs rounded-md border-2 border-dashed border-border-1 p-md',
        'transition-colors hover:bg-gray-1',
      )}
    >
      <span className='flex items-center gap-xs text-sm font-bold leading-md text-black'>
        <ImageUp size={20} aria-hidden className={theme.text} />
        ESの画像から一括入力
      </span>
      <span className='text-xs leading-md text-font-gray'>
        設問・企業名・本文をまとめて読み取ります
      </span>
    </button>
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
 * （本番も react-hook-form の rules で欄ごとにメッセージを出している。
 *   トーストは API エラー専用で、入力漏れには使っていない）
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
  const navigate = useNavigate();
  const isCreate = mode === 'CREATE';

  const [values, setValues] = useState<EntrySheetFormValues>({
    question: '',
    company_name: '',
    episode: '',
    character_limit: '',
    original_content: '',
  });
  const [agreed, setAgreed] = useState(false);
  const [isImageOpen, setIsImageOpen] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  /** 画像から自動入力された項目。手で直したら印を外す */
  const [autoFilled, setAutoFilled] = useState<
    Partial<Record<keyof EntrySheetFormValues, boolean>>
  >({});

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
    },
    [mainField],
  );

  const image = useImageUpload({ onExtracted: handleExtracted });

  const FIELD_LABELS: Partial<Record<keyof EntrySheetFormValues, string>> = {
    question: '設問',
    company_name: '企業名',
    [mainField]: isCreate ? 'エピソード' : 'ESの本文',
  };
  const readFields = Object.entries(autoFilled)
    .filter(([, on]) => on)
    .map(([key]) => FIELD_LABELS[key as keyof EntrySheetFormValues])
    .filter((v): v is string => Boolean(v));

  const imagePanel = (
    <ImageFields
      readFields={readFields}
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
      onClose={() => {
        image.removeImage();
        setIsImageOpen(false);
      }}
    />
  );

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
      next.question = '設問を入力してください';
    }
    if (values.company_name.trim() === '') {
      next.company_name = '企業名を入力してください';
    }
    if (mainText.trim() === '') {
      next[mainField] = isCreate
        ? 'エピソードを入力してください'
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

  return (
    <div className='flex flex-col gap-xl'>
      <Tabs
        options={MODE_OPTIONS}
        value={mode}
        onChange={(next) =>
          navigate(
            next === 'CREATE'
              ? paths.entrySheetsNew
              : paths.entrySheetsReviewNew,
          )
        }
      />

      <p className='text-xs leading-md text-font-gray'>
        {isCreate
          ? '設問とエピソードを入力すると、AIがESの文章を作成します。'
          : '書いたESを貼り付けると、AIが改善点を添削します。'}
      </p>

      {isImageOpen ? (
        imagePanel
      ) : (
        <ImageImportToggle onOpen={() => setIsImageOpen(true)} />
      )}

      <div className='flex flex-col gap-lg'>
        <div className='flex flex-col gap-xs'>
          <FieldLabel label='設問' autoFilled={autoFilled.question} />
          <TextField
            id='es-question'
            value={values.question}
            onChange={(v) => set('question', v)}
            placeholder='例）自己PRを教えてください'
            maxLength={ENTRY_SHEETS_QUESTION_MAX_LENGTH}
            errorMessage={errors.question}
          />
          <OptionChips
            options={ENTRY_SHEETS_QUESTION_OPTIONS}
            onPick={(v) => set('question', v)}
          />
        </div>

        <div className='flex flex-col gap-xs'>
          <FieldLabel label='企業名' autoFilled={autoFilled.company_name} />
          <TextField
            id='es-company_name'
            value={values.company_name}
            onChange={(v) => set('company_name', v)}
            placeholder='例）株式会社サンプル'
            maxLength={ENTRY_SHEETS_COMPANY_NAME_MAX_LENGTH}
            errorMessage={errors.company_name}
          />
          <OptionChips
            options={ENTRY_SHEETS_COMPANY_NAME_SUGGESTIONS}
            onPick={(v) => set('company_name', v)}
          />
        </div>

        {isCreate ? (
          <>
            <div className='flex flex-col gap-xs'>
              <span className='text-sm font-bold leading-md'>文字数の目安</span>
              <div className='flex gap-xs'>
                {ENTRY_SHEETS_CHARACTER_LIMIT_OPTIONS.map((limit) => {
                  const selected = values.character_limit === limit;
                  return (
                    <button
                      key={limit}
                      type='button'
                      onClick={() =>
                        set('character_limit', selected ? '' : limit)
                      }
                      className={cn(
                        'flex-1 rounded-md border px-sm py-xs text-sm leading-md transition-colors',
                        selected
                          ? cn(theme.border, theme.text, theme.bgSoft)
                          : 'border-border-2 bg-white text-black hover:bg-gray-2',
                      )}
                    >
                      {limit}字
                    </button>
                  );
                })}
              </div>
            </div>

            <div className='flex flex-col gap-xs'>
              <FieldLabel label='エピソード' autoFilled={autoFilled.episode} />
              <TextArea
                id='es-episode'
                value={values.episode}
                onChange={(v) => set('episode', v)}
                placeholder='例）大学時代のアルバイトでリーダーを務めた経験'
                maxLength={ENTRY_SHEETS_EPISODE_MAX_LENGTH}
                showCount
                minRows={6}
                errorMessage={errors.episode}
              />
            </div>
          </>
        ) : (
          <div className='flex flex-col gap-xs'>
            <FieldLabel
              label='添削したいES'
              autoFilled={autoFilled.original_content}
            />
            <TextArea
              id='es-original_content'
              value={values.original_content}
              onChange={(v) => set('original_content', v)}
              placeholder='書いたESを貼り付けてください'
              maxLength={ENTRY_SHEETS_ORIGINAL_CONTENT_MAX_LENGTH}
              showCount
              minRows={10}
              errorMessage={errors.original_content}
            />
          </div>
        )}
      </div>

      <div
        className={cn(
          'flex flex-col gap-sm rounded-md p-md',
          errors.agreed ? 'border border-primary-red bg-white' : 'bg-gray-2',
        )}
      >
        <ul className='flex flex-col gap-xxs'>
          {ENTRY_SHEETS_NOTICES.map((notice) => (
            <li key={notice} className='text-xs leading-md text-black'>
              ・{notice}
            </li>
          ))}
        </ul>
        <label className='flex items-center gap-xs text-sm leading-md'>
          <input
            id='es-agreed'
            type='checkbox'
            checked={agreed}
            aria-invalid={errors.agreed ? true : undefined}
            aria-describedby={errors.agreed ? 'es-agreed-error' : undefined}
            onChange={(e) => {
              setAgreed(e.target.checked);
              setErrors((prev) => ({ ...prev, agreed: undefined }));
            }}
            className='size-4 accent-primary-entry-sheet'
          />
          下記の内容に同意する
        </label>
        {errors.agreed && (
          <p id='es-agreed-error' className='text-xs text-primary-red'>
            {errors.agreed}
          </p>
        )}
      </div>

      <Button
        text={isCreate ? 'ESを作成する' : 'ESを添削する'}
        theme={theme}
        onClick={handleSubmit}
        disabled={image.isExtracting}
        isPending={isSubmitting}
      />
    </div>
  );
}
