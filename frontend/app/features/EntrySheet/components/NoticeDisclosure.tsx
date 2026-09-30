import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { ENTRY_SHEETS_NOTICES } from '~/features/EntrySheet/constants';
import { cn } from '~/lib/cn';

/**
 * 生成AIの注意事項。
 *
 * Figma には無いが、本番（shukatsu-box TextCreateForm）が同意を取っているため
 * 残す。ただし常時3行を開いたままにせず、同意チェック1行に畳む。
 *
 * 1画面フォーム（ES作成）とウィザードの最終ステップ（ES添削）の両方で使う。
 */
type Props = {
  agreed: boolean;
  onChange: (next: boolean) => void;
  errorMessage?: string;
};

export function NoticeDisclosure({ agreed, onChange, errorMessage }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className='flex flex-col gap-xs'>
      <div className='flex flex-wrap items-center gap-x-sm gap-y-xxs'>
        <label className='flex items-center gap-xs text-sm leading-md'>
          <input
            id='es-agreed'
            type='checkbox'
            checked={agreed}
            aria-invalid={errorMessage ? true : undefined}
            aria-describedby={errorMessage ? 'es-agreed-error' : undefined}
            onChange={(e) => onChange(e.target.checked)}
            className='size-4 accent-primary-entry-sheet'
          />
          生成AIの注意事項に同意する
        </label>
        <button
          type='button'
          onClick={() => setIsOpen((prev) => !prev)}
          aria-expanded={isOpen}
          aria-controls='es-notices'
          className='flex items-center gap-3xs text-xs text-font-gray hover:opacity-60'
        >
          {isOpen ? '閉じる' : '内容を見る'}
          <ChevronDown
            size={14}
            aria-hidden
            className={cn('transition-transform', isOpen && 'rotate-180')}
          />
        </button>
      </div>

      {isOpen && (
        <ul
          id='es-notices'
          className='flex flex-col gap-xxs rounded-md bg-gray-2 p-sm'
        >
          {ENTRY_SHEETS_NOTICES.map((notice) => (
            <li key={notice} className='text-xs leading-md text-black'>
              ・{notice}
            </li>
          ))}
        </ul>
      )}

      {errorMessage && (
        <p id='es-agreed-error' className='text-xs text-primary-red'>
          {errorMessage}
        </p>
      )}
    </div>
  );
}
