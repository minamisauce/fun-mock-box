import { Check, Copy } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "~/lib/cn";

type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  /** 文字数バッジを出す */
  showCount?: boolean;
  /** コピーボタンを出す */
  showCopy?: boolean;
  minRows?: number;
  className?: string;
  autoFocus?: boolean;
};

export function TextArea({
  value,
  onChange,
  placeholder,
  maxLength,
  showCount = false,
  showCopy = false,
  minRows = 3,
  className,
  autoFocus = false,
}: Props) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [copied, setCopied] = useState(false);

  // 入力量に応じて高さを追従させる
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
    } catch {
      // クリップボードが使えない環境（非セキュアコンテキスト等）では黙って無視する
    }
  };

  return (
    <div className={cn("w-full", className)}>
      <textarea
        ref={ref}
        // biome-ignore lint/a11y/noAutofocus: ウィザードの各ステップで入力欄に直接フォーカスさせたい
        autoFocus={autoFocus}
        rows={minRows}
        value={value}
        maxLength={maxLength}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        // Design System: input/textarea (node 3014:1452)
        // px-md py-sm / 角丸 8px / border-2 / 14px・行間1.5、focus で border を black に
        className={cn(
          "w-full resize-none overflow-hidden rounded-md border border-border-2 bg-white px-md py-sm text-sm leading-md",
          "placeholder:text-font-gray focus:border-black focus:outline-none",
        )}
      />
      {(showCount || showCopy) && (
        <div className="mt-xxs flex items-center justify-between">
          {showCount ? (
            <span className="text-xs text-font-gray">
              {value.length}
              {maxLength ? ` / ${maxLength}` : ""} 文字
            </span>
          ) : (
            <span />
          )}
          {showCopy && (
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-xxs rounded-infinity border border-border-2 px-sm py-3xs text-xs text-black transition-colors hover:bg-gray-2"
            >
              {copied ? (
                <Check size={14} aria-hidden />
              ) : (
                <Copy size={14} aria-hidden />
              )}
              {copied ? "コピーしました" : "文章をコピー"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
