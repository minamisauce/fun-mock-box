import type { ReactNode } from 'react';
import { Button } from '~/components/Button';
import { SuggestChips } from '~/components/SuggestChips';
import { TextArea } from '~/components/TextArea';

type Props = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  /** 記入候補。省略するとチップ列ごと出さない（ES本文のような長文ステップ用） */
  candidates?: readonly string[];
  suggestMaxCount?: number;
  maxLength?: number;
  /** textarea の初期行数。長文を入れるステップでは増やす */
  minRows?: number;
  onNext: () => void;
  /** 最終ステップでは「次へ」ではなく生成ボタンにする */
  nextText?: string;
  isSubmitting?: boolean;
  /**
   * 入力欄とボタンの間に差し込む要素。
   * 最終ステップの同意チェックや、ES1問目の画像入力への導線が入る。
   */
  beforeAction?: ReactNode;
  /** 入力が埋まっていても押させたくないとき（同意が未チェックなど） */
  disabled?: boolean;
};

/**
 * 自由入力ステップ。textarea + 記入候補チップ + 次へボタン。
 * 3ツールで共通なので ToolWizard に置いている（値の出し入れは呼び出し側）。
 */
export function TextStep({
  label,
  value,
  onChange,
  placeholder,
  candidates,
  suggestMaxCount = 6,
  maxLength = 100,
  minRows = 3,
  onNext,
  nextText = '次へ',
  isSubmitting = false,
  beforeAction,
  disabled = false,
}: Props) {
  const isEmpty = value.trim().length === 0;

  return (
    <div className='flex flex-col gap-xl'>
      <h2 className='text-lg font-bold leading-md'>{label}</h2>

      <div className='flex flex-col gap-md'>
        <TextArea
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          maxLength={maxLength}
          showCount
          minRows={minRows}
        />
        {candidates && candidates.length > 0 && (
          <SuggestChips
            candidates={candidates}
            maxCount={suggestMaxCount}
            onPick={onChange}
          />
        )}
      </div>

      {beforeAction}

      <Button
        text={nextText}
        onClick={onNext}
        disabled={isEmpty || disabled}
        isPending={isSubmitting}
      />
    </div>
  );
}
