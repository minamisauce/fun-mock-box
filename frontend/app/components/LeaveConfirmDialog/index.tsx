import { useCallback } from 'react';
import { type BlockerFunction, useBlocker } from 'react-router';
import { Dialog } from '~/components/Dialog';

/**
 * 入力の途中で画面を離れようとしたときに確認を挟む。
 *
 * ツール画面にも BottomNav を出しているので、押し間違いで入力が飛ぶ経路ができる。
 * ただし止めたいのは BottomNav のタップだけではなく、ブラウザバックとヘッダーの
 * 戻るボタンも同じなので、個々の onClick ではなく useBlocker で遷移そのものを
 * 止める。
 *
 * ⚠ 出しすぎると反射で閉じられて効かなくなる。失うものがある間だけ `when` を
 *   true にすること（未入力のステップ1や、保存済みの結果画面では出さない）。
 */
type Props = {
  /**
   * 確認を挟む条件。入力があること（dirty）に加えて、送信中を除くこと。
   * 送信は values を持ったまま結果画面へ遷移するので、除かないと自分の送信を
   * 自分で止めてしまう。
   */
  when: boolean;
  /**
   * このパス配下への遷移は止めない。ウィザードのステップ間移動がこれに当たる。
   * 結果画面のように移動先が無い画面では、その画面自身のパスを渡す。
   */
  keepWithin: string;
};

export function LeaveConfirmDialog({ when, keepWithin }: Props) {
  const blocker = useBlocker(
    // インラインの関数を渡すとレンダーのたびに blocker が張り直される
    useCallback<BlockerFunction>(
      ({ nextLocation }) =>
        when && !nextLocation.pathname.startsWith(keepWithin),
      [when, keepWithin],
    ),
  );

  return (
    <Dialog
      isOpen={blocker.state === 'blocked'}
      title='このページを離れますか？'
      description='入力したデータは保存されません'
      onConfirm={() => blocker.proceed?.()}
      onCancel={() => blocker.reset?.()}
    />
  );
}
