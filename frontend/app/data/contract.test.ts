import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { DataClient } from '~/data/contract';
import { DataError } from '~/data/errors';
import { createLocalClient } from '~/data/local/client';

/**
 * データアクセス層の契約テスト。
 *
 * 同じアサーションを全実装に流すことで、localStorage 実装と HTTP 実装の
 * 振る舞いがズレたままマージされるのを防ぐ。
 * HTTP 実装を足したらこの配列に1行足すだけでよい。
 */
const CLIENTS: Array<[string, () => DataClient]> = [
  ['local', () => createLocalClient()],
];

const selfPromotionRequest = {
  strength: '柔軟性',
  situation: '音楽バンドの活動',
  difficulty: 'メンバーとの意見の違い',
  solution: '部員同士の話し合い',
};

const motivationRequest = {
  industry: '金融',
  sector: '銀行',
  reason: '企業の理念やビジョンへの共感',
  experience: 'リーグ優勝に導いた経験',
};

const entrySheetRequest = {
  question: '学生時代に力を入れたこと',
  company_name: '株式会社サンプル',
  episode: 'カフェでのアルバイト',
};

describe.each(CLIENTS)('%s client', (_name, makeClient) => {
  beforeEach(() => {
    localStorage.clear();
    // created_at が同時刻だと並び順が決まらないので時刻を明示的に進める
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('自己PR', () => {
    it('作成したものを id で取り出せる', async () => {
      const client = makeClient();
      const created = await client.selfPromotions.create(selfPromotionRequest);

      expect(created.title).not.toBe('');
      expect(await client.selfPromotions.get(created.id)).toEqual(created);
    });

    it('一覧は新しい順に返す', async () => {
      const client = makeClient();
      const older = await client.selfPromotions.create(selfPromotionRequest);
      vi.setSystemTime(new Date('2026-01-02T00:00:00.000Z'));
      const newer = await client.selfPromotions.create({
        ...selfPromotionRequest,
        strength: '継続力',
      });

      expect((await client.selfPromotions.list()).map((i) => i.id)).toEqual([
        newer.id,
        older.id,
      ]);
    });

    it('更新した内容が取得にも反映される', async () => {
      const client = makeClient();
      const created = await client.selfPromotions.create(selfPromotionRequest);

      const updated = await client.selfPromotions.update(created.id, {
        title: '編集後タイトル',
        content: '編集後本文',
      });

      expect(updated.content).toBe('編集後本文');
      expect(await client.selfPromotions.get(created.id)).toEqual(updated);
    });

    it('存在しない id の取得は null（throw しない）', async () => {
      const client = makeClient();
      expect(await client.selfPromotions.get('missing')).toBeNull();
    });

    it('存在しない id の更新は not_found で reject する', async () => {
      const client = makeClient();
      await expect(
        client.selfPromotions.update('missing', {
          title: 'x',
          content: 'y',
        }),
      ).rejects.toSatisfy(
        (e: unknown) => e instanceof DataError && e.kind === 'not_found',
      );
    });
  });

  describe('志望動機', () => {
    it('作成したものを id で取り出せる', async () => {
      const client = makeClient();
      const created = await client.motivations.create(motivationRequest);

      expect(await client.motivations.get(created.id)).toEqual(created);
    });

    it('自己PRとは別の一覧になる', async () => {
      const client = makeClient();
      await client.motivations.create(motivationRequest);

      expect(await client.motivations.list()).toHaveLength(1);
      expect(await client.selfPromotions.list()).toHaveLength(0);
    });
  });

  describe('ES', () => {
    it('作成したものは CREATE_V1 の解説を持つ', async () => {
      const client = makeClient();
      const created = await client.entrySheets.create(entrySheetRequest);

      expect(created.type).toBe('CREATE');
      expect(created.ai_explanation_schema_version).toBe('CREATE_V1');
      expect(created.ai_explanation_json.length).toBeGreaterThan(0);
      expect(await client.entrySheets.get(created.id)).toEqual(created);
    });

    it('添削したものは REVIEW_V1 で、添削前の本文を保持する', async () => {
      const client = makeClient();
      const reviewed = await client.entrySheets.review({
        question: '自己PRを教えてください',
        company_name: 'サンプル商事株式会社',
        original_content: '私の強みは課題解決力です。',
      });

      expect(reviewed.type).toBe('REVIEW');
      expect(reviewed.ai_explanation_schema_version).toBe('REVIEW_V1');
      expect(reviewed.original_content).toBe('私の強みは課題解決力です。');
    });

    it('作成と添削は同じ一覧に並ぶ', async () => {
      const client = makeClient();
      await client.entrySheets.create(entrySheetRequest);
      vi.setSystemTime(new Date('2026-01-02T00:00:00.000Z'));
      await client.entrySheets.review({
        question: '自己PRを教えてください',
        company_name: 'サンプル商事株式会社',
        original_content: '私の強みは課題解決力です。',
      });

      expect((await client.entrySheets.list()).map((i) => i.type)).toEqual([
        'REVIEW',
        'CREATE',
      ]);
    });

    it('更新は本文だけ差し替え、解説はそのまま残す', async () => {
      const client = makeClient();
      const created = await client.entrySheets.create(entrySheetRequest);

      const updated = await client.entrySheets.update(created.id, {
        content: '編集後本文',
      });

      expect(updated.content).toBe('編集後本文');
      expect(updated.ai_explanation_json).toEqual(created.ai_explanation_json);
    });

    it('画像からの抽出は本文を返すが、保存はしない', async () => {
      const client = makeClient();
      const file = new File(['dummy'], 'es.png', { type: 'image/png' });

      const extracted = await client.entrySheets.extractFromImage(file);

      expect(extracted.content).not.toBe('');
      expect(await client.entrySheets.list()).toHaveLength(0);
    });
  });
});
