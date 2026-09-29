import { paths } from '~/lib/paths';
import type { EntrySheetModel } from '~/types/entrySheet';
import type { MotivationModel } from '~/types/motivation';
import type { SelfPromotionModel } from '~/types/selfPromotion';
import type { HistoryItem } from './types';

/**
 * 3ツールの結果を1本の新しい順リストにまとめる。
 *
 * created_at は ISO 8601（api-schema の z.iso.datetime()）なので、
 * Date に起こさず文字列のまま比較できる。
 */
export function mergeHistoryItems(
  selfPromotions: SelfPromotionModel[],
  motivations: MotivationModel[],
  entrySheets: EntrySheetModel[],
): HistoryItem[] {
  return [
    ...selfPromotions.map((item) => ({
      id: item.id,
      toolId: 'self-promotion' as const,
      href: paths.selfPromotion(item.id),
      heading: item.title,
      content: item.content,
      created_at: item.created_at,
      updated_at: item.updated_at,
    })),
    ...motivations.map((item) => ({
      id: item.id,
      toolId: 'motivation' as const,
      href: paths.motivation(item.id),
      heading: item.title,
      content: item.content,
      created_at: item.created_at,
      updated_at: item.updated_at,
    })),
    ...entrySheets.map((item) => ({
      id: item.id,
      toolId: 'entry-sheet' as const,
      href: paths.entrySheet(item.id),
      heading: `${item.company_name}／${item.question}`,
      content: item.content,
      created_at: item.created_at,
      updated_at: item.updated_at,
    })),
  ].sort((a, b) => b.created_at.localeCompare(a.created_at));
}
