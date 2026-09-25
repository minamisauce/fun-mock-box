import { cn } from "~/lib/cn";

/**
 * Design System: Components / navigation/tab (node 3019:2138)
 *
 * ページ内の表示切替に使う。グレーの帯の上をアクティブな白いピルが動く形。
 * - 帯: bg-gray-2 / p-1(4px) / 角丸 12px / 幅いっぱい
 * - アクティブ: bg-white / 角丸 8px / shadow-tab / 14px bold
 * - 非アクティブ: 背景なし（文字色はアクティブと同じ黒。白ピルの有無で判別する）
 *
 * ⚠ これはページ内の表示切替専用。フォーム内の入力コントロール
 *    （DS の input/segmentedButton 相当）と同じ画面に並べると
 *    階層が読めなくなるので、役割を混ぜないこと。
 */

type Option<T extends string> = {
  label: string;
  value: T;
};

type Props<T extends string> = {
  options: ReadonlyArray<Option<T>>;
  value: T;
  onChange: (value: T) => void;
  className?: string;
};

export function Tabs<T extends string>({
  options,
  value,
  onChange,
  className,
}: Props<T>) {
  return (
    <div
      role="tablist"
      className={cn("flex w-full items-center rounded-lg bg-gray-2 p-1", className)}
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(option.value)}
            className={cn(
              "min-w-px flex-1 rounded-md p-xs text-center text-sm font-bold leading-none transition-colors",
              selected ? "bg-white text-black shadow-tab" : "text-black",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
