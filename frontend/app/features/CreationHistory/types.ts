import type { ToolActionId } from '~/lib/toolAction';

/**
 * 3ツールの作成物を1本のリストに並べるための表示用の形。
 *
 * モデルごとに見出しになるフィールドが違う（ES はタイトルを持たない）ので、
 * 一覧で使う分だけをこの形に潰してから並べる。
 */
export type HistoryItem = {
  id: string;
  /** ES は作成と添削で用途が分かれる。ラベルとアイコンはここから引く */
  actionId: ToolActionId;
  /** 結果ページへのリンク先 */
  href: string;
  heading: string;
  content: string;
  /** 並び順に使う */
  created_at: string;
  /** カードに「更新 …」として出す */
  updated_at: string;
};
