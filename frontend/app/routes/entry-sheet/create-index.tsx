import { redirect } from 'react-router';
import { CreateStepIdEnum } from '~/features/EntrySheet/constants/stepIds';
import { paths } from '~/lib/paths';
import { removeSession, STORAGE_KEYS } from '~/lib/storage';

/**
 * /entry-sheets/new は先頭ステップへ送るだけ。
 *
 * ここは「新しく作成を始める」入口なので、先に下書きを捨てる。
 * 捨てないと、前回の入力が入った状態でステップ1が開く。
 * ステップURLを直接リロードしたときは通らないので、途中の入力は残る。
 */
export function clientLoader() {
  removeSession(STORAGE_KEYS.entrySheetCreateDraft);
  return redirect(paths.entrySheetsNewStep(CreateStepIdEnum.QUESTION));
}

export default function EntrySheetCreateIndex() {
  return null;
}
