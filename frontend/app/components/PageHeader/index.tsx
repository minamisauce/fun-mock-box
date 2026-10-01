import { Boxes } from 'lucide-react';
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
  // ホームはどのツールでもない面なので、primary ではなく brand を使う
  brand: 'bg-brand px-lg py-lg text-white rounded-b-xl',
  // 下の余白は持たない。続くコンテンツ側の py が間隔を決める
  plain: 'px-md pt-xl text-black',
} as const;

export function PageHeader({ title, variant = 'plain' }: Props) {
  return (
    <header className={cn(VARIANT_CLASS[variant], 'flex items-center gap-xs')}>
      {/* ロゴ代わりのアイコン。3ツールを束ねた「箱」というサービスの性格に
          合うものを lucide から当てている。ブランドの帯でだけ出す */}
      {variant === 'brand' && <Boxes size={24} aria-hidden />}
      <h1 className='text-lg font-bold leading-sm'>{title}</h1>
    </header>
  );
}
