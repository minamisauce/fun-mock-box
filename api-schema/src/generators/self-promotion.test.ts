import { describe, expect, it } from 'vitest';
import type { CreateSelfPromotionRequest } from '../api/self-promotion/self-promotion';
import { generateSelfPromotion } from './self-promotion';

const req: CreateSelfPromotionRequest = {
  strength: '柔軟性',
  situation: '音楽バンドの活動',
  difficulty: 'メンバーとの意見の違い',
  solution: '部員同士の話し合い',
};

describe('generateSelfPromotion', () => {
  it('同じ入力なら同じ結果を返す（デモの再現性）', () => {
    expect(generateSelfPromotion(req)).toEqual(generateSelfPromotion(req));
  });

  it('入力が変われば文面も変わる', () => {
    const other = generateSelfPromotion({ ...req, strength: '継続力' });
    expect(other.content).not.toBe(generateSelfPromotion(req).content);
  });

  it('入力した4項目がすべて本文に反映される', () => {
    const { content } = generateSelfPromotion(req);
    for (const value of Object.values(req)) {
      expect(content).toContain(value);
    }
  });

  it('タイトルは本番の上限に合わせて40文字以内', () => {
    const { title } = generateSelfPromotion({
      ...req,
      strength: 'あ'.repeat(60),
      situation: 'い'.repeat(60),
    });
    expect(title.length).toBeLessThanOrEqual(40);
  });

  it('本番プロンプトと同じ4段落構成になっている', () => {
    const { content } = generateSelfPromotion(req);
    expect(content.split('\n\n')).toHaveLength(4);
  });
});
