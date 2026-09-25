import { describe, expect, it } from 'vitest';
import {
  extractSample,
  generateEntrySheetCreate,
  generateEntrySheetReview,
} from '~/mocks/templates/entrySheet';

const createReq = {
  question: '学生時代に力を入れたこと',
  company_name: '株式会社サンプル',
  episode: 'カフェでのアルバイト',
};

const reviewReq = {
  question: '自己PRを教えてください',
  company_name: 'サンプル商事株式会社',
  original_content: '私の強みは課題解決力です。売上が上がりました。',
};

describe('generateEntrySheetCreate', () => {
  it('同じ入力なら同じ結果を返す', () => {
    expect(generateEntrySheetCreate(createReq)).toEqual(
      generateEntrySheetCreate(createReq),
    );
  });

  it('エピソードと企業名が本文に反映される', () => {
    const { content } = generateEntrySheetCreate(createReq);
    expect(content).toContain(createReq.episode);
    expect(content).toContain(createReq.company_name);
  });

  it('character_limit を指定すると本文がその文字数に収まる', () => {
    const limit = 120;
    const { content } = generateEntrySheetCreate({
      ...createReq,
      character_limit: limit,
    });
    expect(content.length).toBeLessThanOrEqual(limit);
  });

  it('AI解説を返す', () => {
    const { ai_explanation_json } = generateEntrySheetCreate(createReq);
    expect(ai_explanation_json.length).toBeGreaterThan(0);
    for (const entry of ai_explanation_json) {
      expect(entry.title).not.toBe('');
      expect(entry.content).not.toBe('');
    }
  });
});

describe('generateEntrySheetReview', () => {
  it('AI解説は本番の上限どおり3件以内で、before/after/comment が揃っている', () => {
    const { ai_explanation_json } = generateEntrySheetReview(reviewReq);
    expect(ai_explanation_json.length).toBeLessThanOrEqual(3);
    for (const entry of ai_explanation_json) {
      expect(entry.before).not.toBe('');
      expect(entry.after).not.toBe('');
      expect(entry.comment).not.toBe('');
    }
  });

  it('添削後の本文に企業名が入る', () => {
    const { content } = generateEntrySheetReview(reviewReq);
    expect(content).toContain(reviewReq.company_name);
  });
});

describe('extractSample', () => {
  it('同じファイル名なら同じ抽出結果を返す', () => {
    expect(extractSample('es.png')).toEqual(extractSample('es.png'));
  });

  it('本文は必ず返し、設問・企業名は取れないことがある', () => {
    const names = ['a.png', 'b.png', 'c.png', 'd.png', 'e.png'];
    const results = names.map(extractSample);

    for (const result of results) {
      expect(result.content).not.toBe('');
    }
    // 設問が取れないケースが存在する（部分抽出の再現）
    expect(results.some((r) => r.question === undefined)).toBe(true);
  });
});
