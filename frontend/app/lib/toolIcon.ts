import { Building2, FileText, type LucideIcon, Megaphone } from 'lucide-react';
import type { ToolId } from './toolTheme';

/**
 * ツール別のアイコン。
 *
 * ツール一覧と作成履歴で同じ絵・同じ角丸四角の台座を使い、大きさだけを変える
 * （一覧 = 48px / 履歴 = 32px）。同じツールが違う絵や形で出ると、
 * どちらのセクションを見ているのか分からなくなるため。
 *
 * 色は持たない。ツール色は toolTheme の1箇所に集約する。
 */
export const TOOL_ICON: Record<ToolId, LucideIcon> = {
  'self-promotion': Megaphone,
  motivation: Building2,
  'entry-sheet': FileText,
};
