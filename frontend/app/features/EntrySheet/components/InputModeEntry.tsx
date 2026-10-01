import { ChevronRight, ImageUp, PenLine } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '~/lib/cn';

type Props = {
  /** 16px のアイコン。淡色のタイルに載る */
  icon: ReactNode;
  title: string;
  /** 何が起きるかの一行。375px では 20 文字が上限（超えると語の途中で折り返す） */
  description: string;
  onClick: () => void;
  disabled?: boolean;
};

/**
 * ES ウィザードで「もう一方の入力方法」へ渡す行。
 *
 * テキスト入力 ⇄ 画像から一括入力 を相互に行き来するのに使う。両方向で同じ形に
 * するのは、片方だけボタンだと戻り道が別物に見えて、行き止まりに感じるため。
 *
 * ボタン（塗り／枠線）にしない理由は置き場所にある。この行は「次へ」の直前に入る
 * ので、同型のボタンを縦に並べると「次へ」の弱い版に見えてしまう。ホームのツール
 * カードや作成履歴の行と同じ「アイコンタイル + 本文 + chevron」に寄せて、
 * 送信の手前に挟まる別系統の導線だと読めるようにしている。
 */
function InputModeEntry({
  icon,
  title,
  description,
  onClick,
  disabled = false,
}: Props) {
  return (
    <button
      type='button'
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex w-full items-center gap-sm rounded-md border border-border-2 bg-white p-sm text-left transition-shadow',
        // 読み取り中は押させない。ImageFields の削除ボタンと同じ落とし方に揃える
        disabled ? 'cursor-not-allowed opacity-30' : 'hover:shadow-all-sides',
      )}
    >
      <span
        aria-hidden
        className='flex size-8 shrink-0 items-center justify-center rounded-md bg-primary-soft text-primary'
      >
        {icon}
      </span>

      <span className='flex min-w-px flex-1 flex-col gap-3xs'>
        <span className='text-sm font-bold leading-md'>{title}</span>
        <span className='text-xs leading-md text-font-gray'>{description}</span>
      </span>

      <ChevronRight size={16} aria-hidden className='shrink-0 text-font-gray' />
    </button>
  );
}

/**
 * 見出しだけでは「画像を1枚貼るだけ」に読めて、手入力より得だと伝わらないため、
 * 何が起きるかを description に置いている。
 *
 * 3項目めの呼び名は作成（エピソード）と添削（本文）で違うので、そこだけ受け取る。
 * 文全体を呼び出し側に出さないのは、読み取る項目の並びは両ウィザードで同じなため。
 */
export function ImageImportEntry({
  contentLabel,
  onClick,
}: {
  /** 読み取る3項目めの呼び名。作成は「エピソード」、添削は「本文」 */
  contentLabel: string;
  onClick: () => void;
}) {
  return (
    <InputModeEntry
      icon={<ImageUp size={16} />}
      title='画像から一括入力'
      // 「まとめて」は入れない。エピソードだと 20 文字を超えて
      // 「読み取ります」が途中で折り返す。一括であることは見出しが伝えている
      description={`質問・企業名・${contentLabel}を読み取ります`}
      onClick={onClick}
    />
  );
}

/** 画像入力画面からテキスト入力へ戻る側。読み取り中は押させない */
export function ManualInputEntry({
  onClick,
  disabled,
}: {
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <InputModeEntry
      icon={<PenLine size={16} />}
      title='手で入力する'
      description='画像を使わず、質問から順に入力します'
      onClick={onClick}
      disabled={disabled}
    />
  );
}
