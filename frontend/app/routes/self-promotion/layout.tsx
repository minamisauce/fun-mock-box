import { Outlet } from 'react-router';
import { SelfPromotionFormProvider } from '~/features/SelfPromotion/hooks/useSelfPromotionForm';
import { toolScope } from '~/lib/toolScope';

/**
 * 自己PRツール配下の共通レイアウト。
 * ウィザードと結果画面でフォーム状態を共有するため、ここに Provider を置く。
 *
 * ツール色のスコープもここで開く。配下のコンポーネントは primary を書くだけで
 * 自己PRの色になる（app.css の [data-tool] を参照）。
 */
export default function SelfPromotionLayout() {
  return (
    <SelfPromotionFormProvider>
      <div {...toolScope('self-promotion')}>
        <Outlet />
      </div>
    </SelfPromotionFormProvider>
  );
}
