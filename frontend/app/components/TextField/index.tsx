import type { KeyboardEvent } from 'react';
import { cn } from '~/lib/cn';

/**
 * Design System: Components / input/textField (node 3014:1434)
 *
 * - px-md py-sm / 角丸 8px / border-2 / 14px・行間1.5
 * - focus で border を black に、error で red に
 *
 * 見出し（タイトル・必須マーク・バッジ）はこのコンポーネントの外で組む。
 * ラベルの組み立て方が2通りあると表記が揺れるため、入力欄の責務に絞っている。
 */

type Props = {
  /** 入力欄そのものの id。エラー時のフォーカス移動に使う */
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  errorMessage?: string;
  className?: string;
  /**
   * 文字数カウンタ。Design System の textField は持たないので既定は非表示。
   * 上限に近づくことを見せたい欄だけ true にする。
   */
  showCount?: boolean;
  /** 数字だけの欄でモバイルのテンキーを出す */
  inputMode?: 'text' | 'numeric';
  onFocus?: () => void;
  onBlur?: () => void;
  onKeyDown?: (event: KeyboardEvent<HTMLInputElement>) => void;
  /**
   * 候補リストと組み合わせて combobox にするときの ARIA。
   * 単体の入力欄として使うときは渡さない（SuggestField が組み立てる）。
   */
  listbox?: {
    id: string;
    isOpen: boolean;
    /** キーボードで選択中の option の id */
    activeOptionId?: string;
  };
};

export function TextField({
  id,
  value,
  onChange,
  placeholder,
  maxLength,
  errorMessage,
  className,
  showCount = false,
  inputMode,
  onFocus,
  onBlur,
  onKeyDown,
  listbox,
}: Props) {
  return (
    <div className={cn('flex w-full flex-col gap-xxs', className)}>
      {/* listbox を渡すと role='combobox' になり aria-expanded は妥当になるが、
          静的解析は条件付きの role を追えないため false positive になる */}
      {/* biome-ignore lint/a11y/useAriaPropsSupportedByRole: 上記のとおり */}
      <input
        type='text'
        id={id}
        inputMode={inputMode}
        aria-invalid={errorMessage ? true : undefined}
        aria-describedby={errorMessage && id ? `${id}-error` : undefined}
        role={listbox ? 'combobox' : undefined}
        aria-autocomplete={listbox ? 'list' : undefined}
        aria-expanded={listbox ? listbox.isOpen : undefined}
        aria-controls={listbox?.isOpen ? listbox.id : undefined}
        aria-activedescendant={listbox?.activeOptionId}
        value={value}
        maxLength={maxLength}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocus}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
        className={cn(
          'w-full rounded-md border bg-white px-md py-sm text-sm leading-md',
          'placeholder:text-font-gray focus:outline-none',
          errorMessage
            ? 'border-primary-red'
            : 'border-border-2 focus:border-black',
        )}
      />
      {errorMessage && (
        <span
          id={id ? `${id}-error` : undefined}
          className='text-xs text-primary-red'
        >
          {errorMessage}
        </span>
      )}
      {showCount && maxLength && !errorMessage && (
        <span className='text-xs text-font-gray'>
          {value.length} / {maxLength} 文字
        </span>
      )}
    </div>
  );
}
