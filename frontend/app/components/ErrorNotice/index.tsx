import { cn } from '~/lib/cn';

type Props = {
  /** DataError.userMessage をそのまま渡す */
  message: string;
  /** 渡すと再試行ボタンを出す */
  onRetry?: () => void;
  className?: string;
};

/**
 * API エラーの表示。トーストは使わず、失敗した操作の近くにインラインで出す。
 * 入力漏れなどの検証エラーは TextField / TextArea の errorMessage を使うこと。
 */
export function ErrorNotice({ message, onRetry, className }: Props) {
  return (
    <div
      role='alert'
      className={cn(
        'flex flex-col items-start gap-xs rounded-md border border-primary-red bg-white p-sm',
        className,
      )}
    >
      <p className='text-xs leading-md text-primary-red'>{message}</p>
      {onRetry && (
        <button
          type='button'
          onClick={onRetry}
          className='text-xs font-bold text-primary-red underline hover:opacity-60'
        >
          再読み込み
        </button>
      )}
    </div>
  );
}
