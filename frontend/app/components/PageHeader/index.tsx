import { cn } from '~/lib/cn';

/**
 * ホーム / 作成履歴のページヘッダー。
 *
 * ツール画面は ToolLayout 側の白いヘッダー（戻るボタン付き）を使う。
 */
type Props = {
  title: string;
  /**
   * brand: サービスのブランド色の帯。入口であるホームだけに使う。
   * plain: 帯にせず地の面（グレー）のまま。下層ページで色や白の帯を足すと、
   *        中身より先にヘッダーへ目が行ってしまう。
   */
  variant?: 'brand' | 'plain';
};

const VARIANT_CLASS = {
  // ツール色ではないので TOOL_THEME は使わない
  brand: 'bg-primary-purple px-md py-md text-white',
  // 下の余白は持たない。続くコンテンツ側の py が間隔を決める
  plain: 'px-md pt-xl text-black',
} as const;

export function PageHeader({ title, variant = 'plain' }: Props) {
  return (
    <header className={cn(VARIANT_CLASS[variant])}>
      <h1 className='text-lg font-bold leading-sm'>{title}</h1>
    </header>
  );
}
