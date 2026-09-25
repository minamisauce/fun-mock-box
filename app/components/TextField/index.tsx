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
};

export function TextField({
  id,
  value,
  onChange,
  placeholder,
  maxLength,
  errorMessage,
  className,
}: Props) {
  return (
    <div className={cn('flex w-full flex-col gap-xxs', className)}>
      <input
        type='text'
        id={id}
        aria-invalid={errorMessage ? true : undefined}
        aria-describedby={errorMessage && id ? `${id}-error` : undefined}
        value={value}
        maxLength={maxLength}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
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
      {maxLength && !errorMessage && (
        <span className='text-xs text-font-gray'>
          {value.length} / {maxLength} 文字
        </span>
      )}
    </div>
  );
}
