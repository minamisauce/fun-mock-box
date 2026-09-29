import { describe, expect, it } from 'vitest';
import type { EntrySheetModel } from '~/types/entrySheet';
import type { MotivationModel } from '~/types/motivation';
import type { SelfPromotionModel } from '~/types/selfPromotion';
import { mergeHistoryItems } from './mergeHistoryItems';

const selfPromotion = (
  id: string,
  created_at: string,
  updated_at = created_at,
): SelfPromotionModel => ({
  id,
  title: `自己PR ${id}`,
  content: '自己PRの本文',
  created_at,
  updated_at,
});

const motivation = (
  id: string,
  created_at: string,
  updated_at = created_at,
): MotivationModel => ({
  id,
  title: `志望動機 ${id}`,
  content: '志望動機の本文',
  created_at,
  updated_at,
});

const entrySheet = (
  id: string,
  created_at: string,
  updated_at = created_at,
): EntrySheetModel => ({
  id,
  type: 'CREATE',
  ai_explanation_schema_version: 'CREATE_V1',
  ai_explanation_json: [],
  question: '学生時代に力を入れたこと',
  company_name: '株式会社ポート',
  content: 'ESの本文',
  created_at,
  updated_at,
});

describe('mergeHistoryItems', () => {
  it('3ツールを混ぜて created_at の新しい順に並べる', () => {
    const merged = mergeHistoryItems(
      [selfPromotion('sp', '2026-09-01T00:00:00.000Z')],
      [motivation('mo', '2026-09-03T00:00:00.000Z')],
      [entrySheet('es', '2026-09-02T00:00:00.000Z')],
    );

    expect(merged.map((item) => item.id)).toEqual(['mo', 'es', 'sp']);
    expect(merged.map((item) => item.toolId)).toEqual([
      'motivation',
      'entry-sheet',
      'self-promotion',
    ]);
  });

  it('結果ページへの href を持つ', () => {
    const merged = mergeHistoryItems(
      [selfPromotion('sp', '2026-09-01T00:00:00.000Z')],
      [motivation('mo', '2026-09-01T00:00:00.000Z')],
      [entrySheet('es', '2026-09-01T00:00:00.000Z')],
    );

    expect(merged.map((item) => item.href).sort()).toEqual([
      '/entry-sheets/es',
      '/motivations/mo',
      '/self-promotions/sp',
    ]);
  });

  it('ES はタイトルを持たないので「企業名／設問」を見出しにする', () => {
    const [item] = mergeHistoryItems(
      [],
      [],
      [entrySheet('es', '2026-09-01T00:00:00.000Z')],
    );

    expect(item?.heading).toBe('株式会社ポート／学生時代に力を入れたこと');
  });

  it('created_at と別に updated_at を持つ（カードの「更新」表示に使う）', () => {
    const merged = mergeHistoryItems(
      [
        selfPromotion(
          'sp',
          '2026-09-01T00:00:00.000Z',
          '2026-09-05T09:30:00.000Z',
        ),
      ],
      [],
      [],
    );

    expect(merged[0]?.created_at).toBe('2026-09-01T00:00:00.000Z');
    expect(merged[0]?.updated_at).toBe('2026-09-05T09:30:00.000Z');
  });

  it('並び順は updated_at ではなく created_at で決まる', () => {
    const merged = mergeHistoryItems(
      // 後から作られたが、更新はされていない
      [selfPromotion('new', '2026-09-03T00:00:00.000Z')],
      // 先に作られ、後から更新された
      [
        motivation(
          'old',
          '2026-09-01T00:00:00.000Z',
          '2026-09-09T00:00:00.000Z',
        ),
      ],
      [],
    );

    expect(merged.map((item) => item.id)).toEqual(['new', 'old']);
  });

  it('すべて空なら空配列', () => {
    expect(mergeHistoryItems([], [], [])).toEqual([]);
  });
});
