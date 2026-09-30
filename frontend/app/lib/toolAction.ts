import {
  Building2,
  FileSearch,
  FileText,
  type LucideIcon,
  Megaphone,
} from 'lucide-react';
import type { ToolId } from './toolTheme';

/**
 * 画面上の「用途」。ツール（= 色の単位）とは1対1ではない。
 *
 * ES は作成と添削で入口を分けているため、entry-sheet ツールに2つの用途が
 * ぶら下がる。ホームのカードと作成履歴の行はどちらも用途の単位なので、
 * ラベルとアイコンをここ1箇所に置いて両者がズレないようにする。
 * 色は用途ではなくツールの属性なので toolTheme が持つ。
 */
export type ToolActionId =
  | 'self-promotion'
  | 'motivation'
  | 'entry-sheet-create'
  | 'entry-sheet-review';

export type ToolAction = {
  /** 色を引くためのツール。TOOL_THEME のキー */
  toolId: ToolId;
  /** 作成履歴のラベル、アイコンの代替テキスト */
  label: string;
  icon: LucideIcon;
};

export const TOOL_ACTION: Record<ToolActionId, ToolAction> = {
  'self-promotion': {
    toolId: 'self-promotion',
    label: '自己PR',
    icon: Megaphone,
  },
  motivation: {
    toolId: 'motivation',
    label: '志望動機',
    icon: Building2,
  },
  'entry-sheet-create': {
    toolId: 'entry-sheet',
    label: 'ES作成',
    icon: FileText,
  },
  'entry-sheet-review': {
    toolId: 'entry-sheet',
    label: 'ES添削',
    icon: FileSearch,
  },
};
