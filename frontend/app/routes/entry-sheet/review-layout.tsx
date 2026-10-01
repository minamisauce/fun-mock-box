import { Outlet } from 'react-router';
import { EntrySheetReviewFormProvider } from '~/features/EntrySheet/hooks/useEntrySheetReviewForm';
import { toolScope } from '~/lib/toolScope';

/**
 * ES添削ウィザード配下の共通レイアウト。
 * ステップ間で入力値を共有するため、ここに Provider を置く。
 * ツール色のスコープもここで開く。
 */
export default function EntrySheetReviewLayout() {
  return (
    <EntrySheetReviewFormProvider>
      <div {...toolScope('entry-sheet')}>
        <Outlet />
      </div>
    </EntrySheetReviewFormProvider>
  );
}
