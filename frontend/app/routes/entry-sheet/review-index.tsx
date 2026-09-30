import { redirect } from 'react-router';
import { ReviewStepIdEnum } from '~/features/EntrySheet/constants/stepIds';
import { paths } from '~/lib/paths';
import { removeSession, STORAGE_KEYS } from '~/lib/storage';

/**
 * /entry-sheets/review/new は先頭ステップへ送るだけ。
 *
 * ここは「新しく添削を始める」入口なので、先に下書きを捨てる。
 * createToolForm はステップ間で値を共有するために sessionStorage へ
 * 同期しており、捨てないと前回の入力が入った状態でステップ1が開く。
 *
 * このローダーは入口を踏んだときだけ走る。ステップURLを直接リロードしても
 * 通らないので、入力途中のリロードでは値が残る（下書き保持の意図は生きる）。
 */
export function clientLoader() {
  removeSession(STORAGE_KEYS.entrySheetReviewDraft);
  return redirect(paths.entrySheetsReviewNewStep(ReviewStepIdEnum.QUESTION));
}

export default function EntrySheetReviewIndex() {
  return null;
}
