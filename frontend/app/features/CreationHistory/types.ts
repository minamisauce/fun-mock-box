import type { ToolId } from '~/lib/toolTheme';

/**
 * 3ツールの作成物を1本のリストに並べるための表示用の形。
 *
 * モデルごとに見出しになるフィールドが違う（ES はタイトルを持たない）ので、
 * 一覧で使う分だけをこの形に潰してから並べる。
 */
export type HistoryItem = {
  id: string;
  toolId: ToolId;
  /** 結果ページへのリンク先 */
  href: string;
  heading: string;
  content: string;
  /** 並び順に使う */
  created_at: string;
  /** カードに「更新 …」として出す */
  updated_at: string;
};
