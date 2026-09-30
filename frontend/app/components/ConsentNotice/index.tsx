/**
 * Figma: 自己PRツール「大変だったことを解決するために何をしましたか？」の
 *        consent ブロック (node 3578:22404)
 *
 * 生成AIに送信することへの同意。送信ボタンの直前に置く。
 * - チェックボックス行は中央寄せ、注意書きは全幅の箇条書き
 * - 箇条書きは 12px / font-gray / 行間 2
 *
 * 文面はツール名だけが差し替わるので、ここで組み立てて表記揺れを防ぐ。
 */

/** 2行目だけツール名が入る。他2行は全ツール共通 */
function buildNotices(toolName: string): string[] {
  return [
    '入力された情報はAPIを経由してChatGPTに送信されます。個人を特定できる情報（氏名やマイナンバーなど）の入力はお控えください',
    `就活や${toolName}の作成に関係のない情報の入力はお控えください`,
    'ChatGPTによって作成される文章は正確性をかく場合があります。適宜編集した上でご利用ください',
  ];
}

type Props = {
  /** 例: 自己PR / 志望動機 / ES */
  toolName: string;
  agreed: boolean;
  onChange: (next: boolean) => void;
  /** 未同意のまま送信された画面（ES作成）で使う */
  errorMessage?: string;
  /** チェックボックスの id。エラー時のフォーカス移動に使う */
  id?: string;
};

export function ConsentNotice({
  toolName,
  agreed,
  onChange,
  errorMessage,
  id = 'consent-agreed',
}: Props) {
  return (
    <div className='flex w-full flex-col items-center gap-md'>
      <label className='flex items-center gap-xs text-sm leading-md'>
        <input
          id={id}
          type='checkbox'
          checked={agreed}
          aria-invalid={errorMessage ? true : undefined}
          aria-describedby={errorMessage ? `${id}-error` : undefined}
          onChange={(e) => onChange(e.target.checked)}
          className='size-5 rounded-sm accent-primary'
        />
        下記の内容に同意する
      </label>

      <ul className='w-full list-disc pl-lg text-xs leading-xl text-font-gray'>
        {buildNotices(toolName).map((notice) => (
          <li key={notice}>{notice}</li>
        ))}
      </ul>

      {errorMessage && (
        <p id={`${id}-error`} className='text-xs text-danger'>
          {errorMessage}
        </p>
      )}
    </div>
  );
}
