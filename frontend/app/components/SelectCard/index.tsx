import type { ReactNode } from 'react';
import { cn } from '~/lib/cn';
import { TOOL_THEME, type ToolTheme } from '~/lib/toolTheme';

/**
 * Design System: Components / glayButton (node 3047:7006)
 *
 * - bg gray-2 (#f5f5f5)、下辺のみ border-2 (#e5e5e5)、角丸 8px
 * - size xl: 縦積み・中央寄せ・p-xxl(32px)・gap-xs、テキスト 14px W6
 * - size md: 横並び・justify-between・p-md、テキスト 16px
 */

type Option = {
  label: string;
  value: string;
  icon?: ReactNode;
};

type Props = {
  options: readonly Option[];
  /** 選択中の値。選択即遷移の画面では渡さなくてよい */
  value?: string;
  onSelect: (value: string) => void;
  columns?: 1 | 2;
  theme?: ToolTheme;
  className?: string;
};

export function SelectCard({
  options,
  value,
  onSelect,
  columns = 1,
  theme = TOOL_THEME['self-promotion'],
  className,
}: Props) {
  return (
    <div
      className={cn(
        'grid gap-xs',
        columns === 2 ? 'grid-cols-2' : 'grid-cols-1',
        className,
      )}
    >
      {options.map((option) => {
        const selected = value !== undefined && option.value === value;
        return (
          <button
            key={option.value}
            type='button'
            onClick={() => onSelect(option.value)}
            aria-pressed={selected}
            className={cn(
              'flex flex-col items-center justify-center gap-xs rounded-md border-b p-xl text-center text-sm font-bold leading-md transition-colors',
              selected
                ? cn(theme.border, theme.text, theme.bgSoft)
                : 'border-border-2 bg-gray-2 text-black hover:bg-gray-3',
            )}
          >
            {option.icon}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
