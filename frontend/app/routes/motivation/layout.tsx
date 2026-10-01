import { Outlet } from 'react-router';
import { MotivationFormProvider } from '~/features/Motivation/hooks/useMotivationForm';
import { toolScope } from '~/lib/toolScope';

/**
 * 志望動機ツール配下の共通レイアウト。
 * ウィザードと結果画面でフォーム状態を共有するため、ここに Provider を置く。
 * ツール色のスコープもここで開く。
 */
export default function MotivationLayout() {
  return (
    <MotivationFormProvider>
      <div {...toolScope('motivation')}>
        <Outlet />
      </div>
    </MotivationFormProvider>
  );
}
