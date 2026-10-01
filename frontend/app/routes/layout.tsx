import { Outlet } from 'react-router';
import { BottomNav } from '~/components/BottomNav';

/**
 * ボトムナビを持つ画面（ホーム / 作成履歴）の共通フレーム。
 *
 * ツール画面は ToolLayout が別のフレーム（戻るボタン付きヘッダー）を持つので
 * ここには入れない。スマホ幅の枠だけこちらと揃えてある。
 *
 * 地の面は bg-gray-2。カード（白）とボトムナビ（白）を面の色で浮かせるため、
 * ここを白にしない。ツール画面は1画面1タスクでカードが並ばないので白のまま。
 */
export default function MainLayout() {
  return (
    <div className='min-h-dvh bg-gray-1'>
      <div className='mx-auto flex min-h-dvh w-full flex-col bg-gray-2 sm:w-tool sm:shadow-all-sides'>
        <main className='flex-1'>
          <Outlet />
        </main>
        <BottomNav />
      </div>
    </div>
  );
}
