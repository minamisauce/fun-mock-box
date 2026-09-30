import { Outlet } from 'react-router';
import { EntrySheetReviewFormProvider } from '~/features/EntrySheet/hooks/useEntrySheetReviewForm';

/**
 * ES添削ウィザード配下の共通レイアウト。
 * ステップ間で入力値を共有するため、ここに Provider を置く。
 */
export default function EntrySheetReviewLayout() {
  return (
    <EntrySheetReviewFormProvider>
      <Outlet />
    </EntrySheetReviewFormProvider>
  );
}
