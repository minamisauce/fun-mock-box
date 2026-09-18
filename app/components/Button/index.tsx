import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "~/lib/cn";
import { TOOL_THEME, type ToolTheme } from "~/lib/toolTheme";

/**
 * Design System: Components / button (node 3047:6540)
 *
 * - 角丸 8px（--radius/md）、文字 14px（--font-size/sm）、行間 1.5
 * - size lg: p-md / md: px-md py-sm / sm: px-sm py-xs gap-xxs
 * - enable:   bg = ツール色、文字 white
 * - hover:    bg white + ツール色のボーダー + ツール色の文字（反転する）
 * - disabled: bg gray-3 (#e9e9e9) + 文字 font-gray (#999)  ※透過ではない
 */

type Variant = "primary" | "outline" | "text";
type Size = "lg" | "md" | "sm";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  text: string;
  variant?: Variant;
  size?: Size;
  /**
   * ツール色。TOOL_THEME の値をそのまま渡す。
   * 文字列操作でクラス名を組み立てないこと（Tailwind が検出できない）。
   */
  theme?: ToolTheme;
  beforeIcon?: ReactNode;
  afterIcon?: ReactNode;
  isPending?: boolean;
  fullWidth?: boolean;
};

const SIZE_CLASS: Record<Size, string> = {
  lg: "p-md gap-none",
  md: "px-md py-sm gap-none",
  sm: "px-sm py-xs gap-xxs",
};

export function Button({
  text,
  variant = "primary",
  size = "lg",
  theme = TOOL_THEME["self-promotion"],
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
      type="button"
      disabled={isDisabled}
      className={cn(
        // hover でボーダーが増えて 1px ずれないよう、常に透明ボーダーを敷いておく
        "inline-flex items-center justify-center rounded-md border border-transparent text-sm font-bold leading-md transition-colors",
        SIZE_CLASS[size],
        fullWidth && "w-full",
        isDisabled
          ? "cursor-not-allowed bg-gray-3 text-font-gray"
          : variant === "primary"
            ? cn(theme.bg, "text-white", theme.hoverInvert)
            : variant === "outline"
              ? cn("bg-white", theme.border, theme.text)
              : cn("bg-transparent", theme.text),
        className,
      )}
      {...rest}
    >
      {isPending ? (
        <span
          aria-hidden
          className="size-5 animate-spin rounded-infinity border-2 border-font-gray border-t-transparent"
        />
      ) : (
        beforeIcon
      )}
      {text}
      {afterIcon}
    </button>
  );
}
