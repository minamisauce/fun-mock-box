import { type KeyboardEvent, useState } from 'react';
import { TextField } from '~/components/TextField';
import { cn } from '~/lib/cn';

/**
 * Figma: サジェストイメージ (node 3302:4093)
 *
 * 入力欄の下に候補リストを開く combobox。チップ列にしないのは、
 * 設問文のような長い候補でも折り返さずに読めるため。
 *
 * リストは absolute で重ねる。フローに入れると開くたびに下の欄が
 * ずれて、狙っていた欄を押し損ねる。
 */

type Props = {
  id: string;
  value: string;
  onChange: (value: string) => void;
  /** 候補。入力中は部分一致で絞り込む */
  options: readonly string[];
  placeholder?: string;
  maxLength?: number;
  errorMessage?: string;
  inputMode?: 'text' | 'numeric';
  className?: string;
};

export function SuggestField({
  id,
  value,
  onChange,
  options,
  placeholder,
  maxLength,
  errorMessage,
  inputMode,
  className,
}: Props) {
  const listId = `${id}-listbox`;
  const [isFocused, setIsFocused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  // 入力済みの語と完全一致する候補は出さない（選んだ直後に残り続けるため）
  const matched =
    value.trim() === ''
      ? options
      : options.filter((option) => option.includes(value) && option !== value);

  const isOpen = isFocused && matched.length > 0;
  const activeOptionId =
    isOpen && activeIndex >= 0 ? `${listId}-${activeIndex}` : undefined;

  const close = () => {
    setIsFocused(false);
    setActiveIndex(-1);
  };

  const pick = (option: string) => {
    onChange(option);
    close();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      close();
      return;
    }

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (!isOpen) {
        setIsFocused(true);
        setActiveIndex(0);
        return;
      }
      const delta = event.key === 'ArrowDown' ? 1 : -1;
      setActiveIndex((prev) => {
        const next = prev + delta;
        if (next < 0) return matched.length - 1;
        if (next >= matched.length) return 0;
        return next;
      });
      return;
    }

    if (event.key === 'Enter' && isOpen && activeIndex >= 0) {
      // 候補を選んでいる最中の Enter で送信させない
      event.preventDefault();
      const option = matched[activeIndex];
      if (option) pick(option);
    }
  };

  return (
    <div className={cn('relative', className)}>
      <TextField
        id={id}
        value={value}
        onChange={(next) => {
          onChange(next);
          setIsFocused(true);
          setActiveIndex(-1);
        }}
        placeholder={placeholder}
        maxLength={maxLength}
        errorMessage={errorMessage}
        inputMode={inputMode}
        onFocus={() => setIsFocused(true)}
        onBlur={close}
        onKeyDown={handleKeyDown}
        listbox={{ id: listId, isOpen, activeOptionId }}
      />

      {isOpen && (
        // ul/li ではなく div を使う。listbox / option は「対話的なロール」なので
        // 非対話要素（ul・li）に載せると a11y リントに弾かれる
        <div
          id={listId}
          role='listbox'
          className='absolute inset-x-0 top-full z-10 mt-xxs max-h-60 overflow-y-auto rounded-md border border-border-2 bg-white py-xxs shadow-all-sides'
        >
          {matched.map((option, index) => (
            // フォーカスは入力欄に残したまま aria-activedescendant で位置を示すため、
            // option 自体はタブ順に入れない（combobox の定石）
            // biome-ignore lint/a11y/useKeyWithClickEvents: キー操作は入力欄の onKeyDown が担う
            <div
              key={option}
              id={`${listId}-${index}`}
              role='option'
              tabIndex={-1}
              aria-selected={index === activeIndex}
              // blur より先に click を成立させる
              onMouseDown={(event) => event.preventDefault()}
              onMouseEnter={() => setActiveIndex(index)}
              onClick={() => pick(option)}
              className={cn(
                'cursor-pointer px-md py-sm text-sm leading-md text-black',
                index === activeIndex && 'bg-gray-2',
              )}
            >
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
