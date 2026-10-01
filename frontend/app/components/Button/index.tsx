import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '~/lib/cn';

/**
 * Design System: Components / button (node 3047:6540)
 *
 * - 角丸 8px（--radius/md）、文字 14px（--font-size/sm）、行間 1.5
 * - size lg: p-md / md: px-md py-sm / sm: px-sm py-xs gap-xxs
 * - enable:   bg = primary（= 居るツールの色）、文字 white
 * - hover:    bg white + primary のボーダー + primary の文字（反転する）
 * - disabled: bg gray-3 (#e9e9e9) + 文字 font-gray (#999)  ※透過ではない
 *
 * secondary は DS の button/Secondary（枠線グレー + 黒文字）。ツール色を持たない
 * ので、ダイアログの「OK / キャンセル」のように等価な選択肢を並べる場所に使う。
 */

type Variant = 'primary' | 'secondary' | 'outline' | 'text';
type Size = 'lg' | 'md' | 'sm';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  text: string;
  variant?: Variant;
  size?: Size;
  beforeIcon?: ReactNode;
  afterIcon?: ReactNode;
  isPending?: boolean;
  fullWidth?: boolean;
};

const SIZE_CLASS: Record<Size, string> = {
  lg: 'p-md gap-none',
  md: 'px-md py-sm gap-none',
  sm: 'px-sm py-xs gap-xxs',
};

const VARIANT_CLASS: Record<Variant, string> = {
  primary:
    'bg-primary text-white hover:border-primary hover:bg-white hover:text-primary',
  secondary: 'border-border-2 bg-white text-black hover:bg-gray-2',
  outline: 'border-primary bg-white text-primary',
  text: 'bg-transparent text-primary',
};

export function Button({
  text,
  variant = 'primary',
  size = 'lg',
  beforeIcon,
  afterIcon,
  isPending = false,
  fullWidth = true,
  className,
  disabled,
  ...rest
}: Props) {
  const isDisabled = disabled || isPending;

  return (
    <button
      type='button'
      disabled={isDisabled}
      className={cn(
        // hover でボーダーが増えて 1px ずれないよう、常に透明ボーダーを敷いておく
        'inline-flex items-center justify-center rounded-md border border-transparent text-sm font-bold leading-md transition-colors',
        SIZE_CLASS[size],
        fullWidth && 'w-full',
        isDisabled
          ? 'cursor-not-allowed bg-gray-3 text-font-gray'
          : VARIANT_CLASS[variant],
        className,
      )}
      {...rest}
    >
      {isPending ? (
        <span
          aria-hidden
          className='size-5 animate-spin rounded-infinity border-2 border-font-gray border-t-transparent'
        />
      ) : (
        beforeIcon
      )}
      {text}
      {afterIcon}
    </button>
  );
}
