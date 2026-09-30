import { History, House } from 'lucide-react';
import { NavLink } from 'react-router';
import { cn } from '~/lib/cn';
import { paths } from '~/lib/paths';

/**
 * ホーム / 作成履歴を行き来するグローバルナビ。
 *
 * ツール画面（ToolLayout）には出さない。ウィザードの途中に別セクションへの
 * 導線があると、入力中の内容を捨てる操作が1タップで踏めてしまうため。
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
                  // アクティブはヘッダーと同じブランド色。上下のクロームを揃える
                  isActive ? 'text-brand' : 'text-font-gray',
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
