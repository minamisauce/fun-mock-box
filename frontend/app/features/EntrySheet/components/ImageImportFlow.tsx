import { type ReactNode, useState } from 'react';
import { Button } from '~/components/Button';
import { ConsentNotice } from '~/components/ConsentNotice';
import { GeneratingOverlay } from '~/components/GeneratingOverlay';
import { TextArea } from '~/components/TextArea';
import { ImageFields } from '~/features/EntrySheet/components/ImageFields';
import { ImagePreviewCard } from '~/features/EntrySheet/components/ImagePreviewCard';
import { ManualInputEntry } from '~/features/EntrySheet/components/InputModeEntry';
import {
  ENTRY_SHEETS_COMPANY_NAME_MAX_LENGTH,
  ENTRY_SHEETS_QUESTION_MAX_LENGTH,
  ENTRY_SHEETS_TEXT,
} from '~/features/EntrySheet/constants';
import { useImageUpload } from '~/features/EntrySheet/hooks/useImageUpload';
import type { ExtractedEntrySheet } from '~/types/entrySheet';

/**
 * 読み取り中のオーバーレイ。生成中（GENERATING_MESSAGES）とは別の文面にして、
 * 「作られている」のではなく「読まれている」と分かるようにする。
 */
const EXTRACTING_MESSAGES = [
  '画像を読み取っています…',
  '文字を起こしています…',
  '内容を整理しています…',
] as const;

/** 文字数の入力欄。4桁あれば足りる（1画面フォーム版と同じ） */
const CHARACTER_LIMIT_MAX_DIGITS = 4;

export type ImportedEntrySheetValues = {
  question: string;
  company_name: string;
  /** 作成モードのみ。未指定は空文字 */
  character_limit: string;
  content: string;
};

type Props = {
  /** 本文の文字数上限。作成（episode）と添削（original_content）で違う */
  contentMaxLength: number;
  /** 本文のラベル。作成と添削で文言が違う */
  contentLabel: string;
  /** 本文の入力例。空欄だったときの手がかりになる */
  contentPlaceholder: string;
  /** 文字数の指定を持つのは作成モードだけ */
  withCharacterLimit?: boolean;
  /** 実行ボタンの文言（例: ESを作成する / ESを添削する） */
  confirmLabel: string;
  /** 生成中。ボタンをスピナーにする */
  isSubmitting?: boolean;
  /** 送信できない環境（WebGPU 非対応など） */
  isSubmitDisabled?: boolean;
  onConfirm: (values: ImportedEntrySheetValues) => void;
  /** 画像をやめて手入力に戻る */
  onCancel: () => void;
};

/**
 * 画像から一括入力する一連の流れ。3状態を持つ。
 *
 *   1. 未選択   … 破線の枠（ImageFields）
 *   2. 読み取り中 … 全画面のオーバーレイ
 *   3. 読み取り後 … 読めた内容をフォームに載せ、直してそのまま実行する
 *
 * 3 を挟むのは、OCR は読み違えるものなので、実行前に直せる場所が要るため。
 * この画面でウィザードの全項目が揃うので、残りのステップは踏まずに送信まで行く。
 * そのぶん生成AIへの同意もここで取る（最終ステップと同じ ConsentNotice）。
 *
 * 実際の送信はウィザードのルートが持っているので、値は onConfirm で返す。
 */
export function ImageImportFlow({
  contentMaxLength,
  contentLabel,
  contentPlaceholder,
  withCharacterLimit = false,
  confirmLabel,
  isSubmitting = false,
  isSubmitDisabled = false,
  onConfirm,
  onCancel,
}: Props) {
  const image = useImageUpload();
  // 三項の中で narrow が効くようにローカルに受ける
  const extracted = image.extracted;

  return (
    <>
      {extracted ? (
        <>
          {/* 読み取り中と同じカードを見出しの直下に残す。
              直している内容がどの画像から来たのかを見失わないため */}
          <ImagePreviewCard
            preview={image.preview}
            fileName={image.fileName}
            onRemove={image.removeImage}
          />
          <ExtractedReview
            // 読み取り直したら入力欄の中身も作り直す。
            // effect で props に同期させるより key で作り直す方が事故がない
            key={extracted.content}
            extracted={extracted}
            contentMaxLength={contentMaxLength}
            contentLabel={contentLabel}
            contentPlaceholder={contentPlaceholder}
            withCharacterLimit={withCharacterLimit}
            confirmLabel={confirmLabel}
            isSubmitting={isSubmitting}
            isSubmitDisabled={isSubmitDisabled}
            onConfirm={onConfirm}
            onReselect={image.removeImage}
          />
        </>
      ) : (
        <>
          <ImageFields
            preview={image.preview}
            fileName={image.fileName}
            error={image.error}
            isExtracting={image.isExtracting}
            fileInputRef={image.fileInputRef}
            onSelectFile={image.selectFile}
            onFileChange={image.handleFile}
            onRemove={image.removeImage}
          />
          <ManualInputEntry onClick={onCancel} disabled={image.isExtracting} />
        </>
      )}

      <GeneratingOverlay
        isOpen={image.isExtracting}
        messages={EXTRACTING_MESSAGES}
      />
    </>
  );
}

/**
 * ラベルと入力欄の組。EntrySheetForm の form-group と同じ間隔（4px）にしている。
 * ラベルは htmlFor で入力欄に紐づけ、タップでフォーカスが入るようにする。
 */
function Field({
  htmlFor,
  label,
  required = false,
  hint,
  children,
}: {
  htmlFor: string;
  label: string;
  required?: boolean;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className='flex flex-col gap-xxs'>
      <label
        htmlFor={htmlFor}
        className='flex items-center gap-xxs text-sm font-bold leading-md'
      >
        {label}
        {required && (
          <span className='font-normal text-danger' aria-hidden>
            *
          </span>
        )}
        {required && <span className='sr-only'>（必須）</span>}
      </label>
      {children}
      {hint && <p className='text-xs leading-md text-font-gray'>{hint}</p>}
    </div>
  );
}

type ReviewProps = {
  extracted: ExtractedEntrySheet;
  contentMaxLength: number;
  contentLabel: string;
  contentPlaceholder: string;
  withCharacterLimit: boolean;
  confirmLabel: string;
  isSubmitting: boolean;
  isSubmitDisabled: boolean;
  onConfirm: (values: ImportedEntrySheetValues) => void;
  onReselect: () => void;
};

/**
 * 読み取り結果の確認。全項目を編集でき、そのまま実行まで行く。
 *
 * 読み取れなかった項目は空欄で出る。以前はここで手入力画面へ引き返していたが、
 * その場で埋められるならわざわざ戻す必要がない。
 */
function ExtractedReview({
  extracted,
  contentMaxLength,
  contentLabel,
  contentPlaceholder,
  withCharacterLimit,
  confirmLabel,
  isSubmitting,
  isSubmitDisabled,
  onConfirm,
  onReselect,
}: ReviewProps) {
  const [question, setQuestion] = useState(extracted.question ?? '');
  const [companyName, setCompanyName] = useState(extracted.company_name ?? '');
  const [characterLimit, setCharacterLimit] = useState('');
  const [content, setContent] = useState(extracted.content);
  const [agreed, setAgreed] = useState(false);

  // 最終ステップの requiredParams と同じ条件。character_limit は任意なので含めない
  const canProceed =
    question.trim() !== '' &&
    companyName.trim() !== '' &&
    content.trim() !== '';

  return (
    <div className='flex flex-col gap-xl'>
      <div className='flex flex-col gap-md'>
        <Field htmlFor='import-question' label='ESの質問' required>
          <TextArea
            id='import-question'
            value={question}
            onChange={setQuestion}
            placeholder={ENTRY_SHEETS_TEXT.question.placeholder}
            maxLength={ENTRY_SHEETS_QUESTION_MAX_LENGTH}
            minRows={1}
            showCount
          />
        </Field>

        <Field htmlFor='import-company_name' label='提出する企業名' required>
          <TextArea
            id='import-company_name'
            value={companyName}
            onChange={setCompanyName}
            placeholder='例）株式会社サンプル'
            maxLength={ENTRY_SHEETS_COMPANY_NAME_MAX_LENGTH}
            minRows={1}
            showCount
          />
        </Field>

        {withCharacterLimit && (
          <Field
            htmlFor='import-character_limit'
            label={ENTRY_SHEETS_TEXT.characterLimit.label}
            // suffix（文字以内）は入力欄の右に置く単位なので、縦積みのここでは
            // そのまま使えない。数値が何を意味するかを例で示す
            hint='例）400 なら400文字以内で作成します'
          >
            <TextArea
              id='import-character_limit'
              value={characterLimit}
              // 数字以外を落とす。改行もここで消えるので1行に収まる
              onChange={(next) =>
                setCharacterLimit(next.replace(/[^0-9]/g, ''))
              }
              placeholder={ENTRY_SHEETS_TEXT.characterLimit.placeholder}
              maxLength={CHARACTER_LIMIT_MAX_DIGITS}
              minRows={1}
            />
          </Field>
        )}

        <Field htmlFor='import-content' label={contentLabel} required>
          <TextArea
            id='import-content'
            value={content}
            onChange={setContent}
            placeholder={contentPlaceholder}
            maxLength={contentMaxLength}
            minRows={10}
            showCount
          />
        </Field>
      </div>

      {/* この画面から直接送信するので、同意も最終ステップではなくここで取る */}
      <ConsentNotice
        id='import-consent'
        toolName='ES'
        agreed={agreed}
        onChange={setAgreed}
      />

      <div className='flex flex-col gap-sm'>
        <Button
          text={confirmLabel}
          onClick={() =>
            onConfirm({
              question: question.trim(),
              company_name: companyName.trim(),
              character_limit: characterLimit,
              content: content.trim(),
            })
          }
          disabled={!canProceed || !agreed || isSubmitDisabled}
          isPending={isSubmitting}
        />
        <Button
          text='別の画像を選ぶ'
          variant='outline'
          onClick={onReselect}
          disabled={isSubmitting}
        />
      </div>
    </div>
  );
}
