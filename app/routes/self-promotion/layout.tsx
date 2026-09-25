import { Outlet } from 'react-router';
import { SelfPromotionFormProvider } from '~/features/SelfPromotion/hooks/useSelfPromotionForm';

/**
 * 自己PRツール配下の共通レイアウト。
 * ウィザードと結果画面でフォーム状態を共有するため、ここに Provider を置く。
 */
export default function SelfPromotionLayout() {
  return (
    <SelfPromotionFormProvider>
      <Outlet />
    </SelfPromotionFormProvider>
  );
}
