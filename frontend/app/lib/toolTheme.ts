/**
 * ツール別のブランドカラー。
 *
 * ⚠ Tailwind はソースを静的にスキャンするため `bg-primary-${toolId}` のような
 *   動的なクラス名は CSS が生成されない。必ず完全なクラス文字列をここに持ち、
 *   共通コンポーネントには `theme={TOOL_THEME["self-promotion"]}` の形で渡す。
 */
export type ToolId = 'self-promotion' | 'motivation' | 'entry-sheet';

export type ToolTheme = {
  /** 背景（塗り） */
  bg: string;
  /** 文字色 */
  text: string;
  /** 枠線 */
  border: string;
  /** 淡い背景（選択中カードなど） */
  bgSoft: string;
  /**
   * Design System の button hover 表現。
   * 塗り → 白背景 + ツール色のボーダー / 文字、に反転する。
   */
  hoverInvert: string;
};

export const TOOL_THEME: Record<ToolId, ToolTheme> = {
  'self-promotion': {
    bg: 'bg-primary-self-promotion',
    text: 'text-primary-self-promotion',
    border: 'border-primary-self-promotion',
    bgSoft: 'bg-purple-90',
    hoverInvert:
      'hover:bg-white hover:border-primary-self-promotion hover:text-primary-self-promotion',
  },
  motivation: {
    bg: 'bg-primary-motivation',
    text: 'text-primary-motivation',
    border: 'border-primary-motivation',
    bgSoft: 'bg-motivation-90',
    hoverInvert:
      'hover:bg-white hover:border-primary-motivation hover:text-primary-motivation',
  },
  'entry-sheet': {
    bg: 'bg-primary-entry-sheet',
    text: 'text-primary-entry-sheet',
    border: 'border-primary-entry-sheet',
    bgSoft: 'bg-entry-sheet-90',
    hoverInvert:
      'hover:bg-white hover:border-primary-entry-sheet hover:text-primary-entry-sheet',
  },
};
