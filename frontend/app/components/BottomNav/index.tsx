import { History, House } from 'lucide-react';
import { NavLink } from 'react-router';
import { cn } from '~/lib/cn';
import { paths } from '~/lib/paths';

/**
 * ホーム / 作成履歴を行き来するグローバルナビ。
 *
 * ツール画面（ToolLayout）にも出す。入力中に押しても LeaveConfirmDialog が
 * 遷移を止めるので、1タップで入力が消えることはない。
 *
 * アクティブ色は brand ではなく primary。ホーム・作成履歴では両者が同値なので
 * 見た目は変わらず、ツール画面配下ではそのツールの色になる。ただしツール画面では
 * ホームも作成履歴もアクティブにならないので、実際に色が出るのは前者だけ。
 *
 * ⚠ position: fixed にしない。sm 以上でフレーム（w-tool = 375px）を突き抜けて
 *    画面幅いっぱいに広がる。フレームの内側で sticky bottom-0 にして追従させる。
 */

const NAV_ITEMS = [
  { to: paths.home, label: 'ホーム', icon: House },
  { to: paths.history, label: '作成履歴', icon: History },
] as const;

export function BottomNav() {
  return (
    <nav className='sticky bottom-0 z-10 border-t border-border-2 bg-white'>
      <ul className='flex items-stretch'>
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <li key={to} className='min-w-px flex-1'>
            {/* end: paths.home は "/" なので、これが無いと全ルートで active になる */}
            <NavLink
              to={to}
              end
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center gap-3xs px-xs py-xs leading-none hover:opacity-60',
                  // ツール配下では primary がそのツールの色に差し替わる
                  isActive ? 'text-primary' : 'text-font-gray',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={24} aria-hidden />
                  <span className={cn('text-xxs', isActive && 'font-bold')}>
                    {label}
                  </span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
