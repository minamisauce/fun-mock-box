import { describe, expect, it } from 'vitest';
import type { CreateMotivationRequest } from '../api/motivation/motivation';
import { generateMotivation } from './motivation';

const req: CreateMotivationRequest = {
  industry: '金融',
  sector: '銀行',
  reason: '企業の理念やビジョンへの共感',
  experience: 'リーグ優勝に導いた経験',
};

describe('generateMotivation', () => {
  it('同じ入力なら同じ結果を返す', () => {
    expect(generateMotivation(req)).toEqual(generateMotivation(req));
  });

  it('入力が変われば文面も変わる', () => {
    const other = generateMotivation({ ...req, sector: '証券' });
    expect(other.content).not.toBe(generateMotivation(req).content);
  });

  it('入力した4項目がすべて本文に反映される', () => {
    const { content } = generateMotivation(req);
    for (const value of Object.values(req)) {
      expect(content).toContain(value);
    }
  });

  it('本番プロンプトと同じ5段落構成になっている', () => {
    const { content } = generateMotivation(req);
    expect(content.split('\n\n')).toHaveLength(5);
  });

  it('タイトルは40文字以内', () => {
    const { title } = generateMotivation({
      ...req,
      sector: 'あ'.repeat(60),
    });
    expect(title.length).toBeLessThanOrEqual(40);
  });
});
