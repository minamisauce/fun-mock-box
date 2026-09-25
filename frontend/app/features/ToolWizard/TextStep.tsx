import { Button } from '~/components/Button';
import { SuggestChips } from '~/components/SuggestChips';
import { TextArea } from '~/components/TextArea';
import type { ToolTheme } from '~/lib/toolTheme';

type Props = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  candidates: readonly string[];
  suggestMaxCount?: number;
  maxLength?: number;
  onNext: () => void;
  /** 最終ステップでは「次へ」ではなく生成ボタンにする */
  nextText?: string;
  isSubmitting?: boolean;
  theme: ToolTheme;
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
  onNext,
  nextText = '次へ',
  isSubmitting = false,
  theme,
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
          minRows={3}
        />
        <SuggestChips
          candidates={candidates}
          maxCount={suggestMaxCount}
          onPick={onChange}
        />
      </div>

      <Button
        text={nextText}
        onClick={onNext}
        disabled={isEmpty}
        isPending={isSubmitting}
        theme={theme}
      />
    </div>
  );
}
