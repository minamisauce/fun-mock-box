import type { ReactNode } from "react";
import { SelectCard } from "~/components/SelectCard";
import type { ToolTheme } from "~/lib/toolTheme";

type Option = {
  label: string;
  value: string;
  icon?: ReactNode;
};

type Props = {
  label: string;
  options: readonly Option[];
  onSelect: (value: string) => void;
  columns?: 1 | 2;
  theme: ToolTheme;
};

/**
 * 選択肢から1つ選ぶステップ。選択と同時に次へ進む（本番と同じ挙動）。
 * 選んだ値をどのフィールドに入れるかはツール側の薄いラッパが決める。
 */
export function SelectStep({
  label,
  options,
  onSelect,
  columns = 2,
  theme,
}: Props) {
  return (
    <div className="flex flex-col gap-xl">
      <h2 className="text-lg font-bold leading-md">{label}</h2>
      <SelectCard
        options={options}
        onSelect={onSelect}
        columns={columns}
        theme={theme}
      />
    </div>
  );
}
