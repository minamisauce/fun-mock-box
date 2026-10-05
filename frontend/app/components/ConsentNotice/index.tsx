import { Check } from 'lucide-react';

/**
 * Figma: 自己PRツール「大変だったことを解決するために何をしましたか？」の
 *        consent ブロック (node 3578:22404)
 *
 * 生成AIで文章を作ることへの同意。送信ボタンの直前に置く。
 * - チェックボックス行は中央寄せ、注意書きは全幅の箇条書き
 * - 箇条書きは 12px / font-gray / 行間 2
 *
 * 文面はツール名だけが差し替わるので、ここで組み立てて表記揺れを防ぐ。
 *
 * 就活BOX の本番は ChatGPT（API）に送るが、ここではブラウザ内のモデルで生成するので、
 * 1・3行目は実際の動き（外部に送らない／小さいモデルは誤りやすい）に合わせている。
 */

/** 2行目だけツール名が入る。他2行は全ツール共通 */
function buildNotices(toolName: string): string[] {
  return [
    '文章はこの端末のブラウザの中で動くAIが作成し、入力された情報は生成のために外部へ送信されません。初回はAIのモデル（約0.5〜1GB）をダウンロードします',
    `就活や${toolName}の作成に関係のない情報の入力はお控えください`,
    'AIによって作成される文章は正確性をかく場合があります。適宜編集した上でご利用ください',
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
        {/* accent-color は「チェックの色」を指定できない。ブラウザが塗りの明度から
            自動で決めるため、primary が明るいツール（ES=緑 / 志望動機=ターコイズ）
            では黒いチェックになり、自己PR=紫だけ白になってツール間でばらつく。
            色を固定する手段が他に無いので appearance-none にして自前で描く。 */}
        <span className='relative inline-flex size-5 shrink-0'>
          <input
            id={id}
            type='checkbox'
            checked={agreed}
            aria-invalid={errorMessage ? true : undefined}
            aria-describedby={errorMessage ? `${id}-error` : undefined}
            onChange={(e) => onChange(e.target.checked)}
            className='peer size-5 appearance-none rounded-sm border border-border-1 bg-white transition-colors checked:border-primary checked:bg-primary'
          />
          {/* input の兄弟に置くこと。peer-checked はセレクタの都合で後ろの要素にしか効かない */}
          <Check
            size={14}
            aria-hidden
            className='pointer-events-none absolute inset-0 m-auto text-white opacity-0 peer-checked:opacity-100'
          />
        </span>
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
