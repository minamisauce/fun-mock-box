/**
 * ISO 8601 の日時文字列を一覧表示用に整える。
 *
 * 当日のものは日付を「今日」に置き換える（今日 14:30 / 2026/09/29 14:30）。
 * 直近に触ったものが一覧の中で見分けやすくなるため。
 *
 * サーバーは UTC で返すので、端末のタイムゾーンに寄せて表示する。
 * dayjs は入れていない（この1箇所のために依存を増やさない）。
 */
const DATE_FORMATTER = new Intl.DateTimeFormat('ja-JP', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

const TIME_FORMATTER = new Intl.DateTimeFormat('ja-JP', {
  hour: '2-digit',
  minute: '2-digit',
});

/** 端末のタイムゾーンで見た暦日が同じか */
function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/**
 * @param now 「今日」の判定基準。テストから固定するためだけの引数
 * @returns パースできない値は空文字。呼び出し側はそのまま非表示にできる
 */
export function formatDateTime(iso: string, now: Date = new Date()): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';

  const datePart = isSameDay(date, now) ? '今日' : DATE_FORMATTER.format(date);
  return `${datePart} ${TIME_FORMATTER.format(date)}`;
}
