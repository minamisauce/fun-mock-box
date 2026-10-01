import { Outlet } from 'react-router';
import { EntrySheetCreateFormProvider } from '~/features/EntrySheet/hooks/useEntrySheetCreateForm';
import { toolScope } from '~/lib/toolScope';

/**
 * ES作成ウィザード配下の共通レイアウト。
 * ステップ間で入力値を共有するため、ここに Provider を置く。
 * ツール色のスコープもここで開く。
 */
export default function EntrySheetCreateLayout() {
  return (
    <EntrySheetCreateFormProvider>
      <div {...toolScope('entry-sheet')}>
        <Outlet />
      </div>
    </EntrySheetCreateFormProvider>
  );
}
