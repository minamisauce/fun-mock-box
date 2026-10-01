import { useEffect, useRef } from 'react';
import { Button } from '~/components/Button';

/**
 * Design System: overlay/modal (node 3025:1450)
 *
 * - カード: 白 / p-xl / gap-xl / rounded-md、幅 343px（フレーム 375px - px-md*2）
 * - 見出し 16px 太字・説明 14px。どちらも中央寄せ
 * - ボタンは Secondary（枠線）を横並び。左が確定、右がキャンセル
 *
 * ネイティブの <dialog> を showModal() で開く。フォーカストラップ・Esc・背面の
 * inert 化がブラウザ側で付いてくるので、自前で持たない。
 *
 * ⚠ open 属性を直接書かないこと。showModal() を通さないと top-layer に乗らず、
 *   上の3つがどれも効かない（見た目だけ同じものができてしまう）。
 *
 * BottomNav と違い、375px のフレームを突き抜けて画面全体を覆うのが正しいので、
 * top-layer に出ることは問題にならない。
 */
type Props = {
  isOpen: boolean;
  title: string;
  description?: string;
  /** 確定側。既定は DS の文言 */
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export function Dialog({
  isOpen,
  title,
  description,
  confirmText = 'OK',
  cancelText = 'キャンセル',
  onConfirm,
  onCancel,
}: Props) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    // 二重に呼ぶと InvalidStateError になるので、開閉状態を見てから呼ぶ
    if (isOpen && !dialog.open) dialog.showModal();
    if (!isOpen && dialog.open) dialog.close();
  }, [isOpen]);

  return (
    <dialog
      ref={ref}
      // Esc はキャンセル扱い。既定の close を止めて、開閉は必ず呼び出し側の
      // isOpen に一本化する（DOM 側で閉じると state とズレて再度開けなくなる）
      onCancel={(e) => {
        e.preventDefault();
        onCancel();
      }}
      className='m-auto w-[343px] max-w-[calc(100%-2*var(--spacing-md))] rounded-md bg-white p-xl shadow-modal backdrop:bg-black/40'
    >
      <div className='flex flex-col gap-xl'>
        <div className='flex flex-col gap-xxs text-center text-black'>
          <h2 className='text-md font-bold'>{title}</h2>
          {description && <p className='text-sm'>{description}</p>}
        </div>

        {/* 等価な2択なので、どちらも Secondary で同じ重さにする */}
        <div className='flex gap-md'>
          <Button
            text={confirmText}
            variant='secondary'
            fullWidth={false}
            className='min-w-px flex-1'
            onClick={onConfirm}
          />
          <Button
            text={cancelText}
            variant='secondary'
            fullWidth={false}
            className='min-w-px flex-1'
            onClick={onCancel}
          />
        </div>
      </div>
    </dialog>
  );
}
