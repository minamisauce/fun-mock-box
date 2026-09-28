import type { EntrySheetModel } from '@fun/api-schema';
import { beforeEach, describe, expect, it } from 'vitest';
import {
  request,
  requestJson,
  resetDatabase,
  USER_A,
  USER_B,
} from '../../test/request';

const createRequest = {
  question: '学生時代に力を入れたこと',
  company_name: '株式会社サンプル',
  episode: 'カフェでのアルバイト',
};

const reviewRequest = {
  question: '自己PRを教えてください',
  company_name: 'サンプル商事株式会社',
  original_content: '私の強みは課題解決力です。',
};

function create(anonymousId = USER_A) {
  return requestJson<EntrySheetModel>('/api/entry-sheets', anonymousId, {
    method: 'POST',
    json: createRequest,
  });
}

describe('/api/entry-sheets', () => {
  beforeEach(resetDatabase);

  it('作成したものは CREATE_V1 の解説を持ち、Json 列を往復しても壊れない', async () => {
    const created = await create();
    expect(created.type).toBe('CREATE');
    expect(created.ai_explanation_schema_version).toBe('CREATE_V1');

    const fetched = await requestJson<EntrySheetModel>(
      `/api/entry-sheets/${created.id}`,
      USER_A,
    );

    expect(fetched.ai_explanation_json).toEqual(created.ai_explanation_json);
    expect(fetched.ai_explanation_json.length).toBeGreaterThan(0);
  });

  it('添削は REVIEW_V1 で、添削前の本文を保持する', async () => {
    const res = await request('/api/entry-sheets/review', USER_A, {
      method: 'POST',
      json: reviewRequest,
    });
    expect(res.status).toBe(201);

    const reviewed = (await res.json()) as EntrySheetModel;
    expect(reviewed.type).toBe('REVIEW');
    expect(reviewed.ai_explanation_schema_version).toBe('REVIEW_V1');
    expect(reviewed.original_content).toBe(reviewRequest.original_content);
  });

  it('作成と添削が同じ一覧に並ぶ', async () => {
    await create();
    await request('/api/entry-sheets/review', USER_A, {
      method: 'POST',
      json: reviewRequest,
    });

    expect(
      await requestJson<EntrySheetModel[]>('/api/entry-sheets', USER_A),
    ).toHaveLength(2);
  });

  it('更新は本文だけ差し替え、解説はそのまま残す', async () => {
    const created = await create();
    const updated = await requestJson<EntrySheetModel>(
      `/api/entry-sheets/${created.id}`,
      USER_A,
      { method: 'PATCH', json: { content: '編集後本文' } },
    );

    expect(updated.content).toBe('編集後本文');
    expect(updated.ai_explanation_json).toEqual(created.ai_explanation_json);
  });

  it('別のユーザーからは取得できない（404）', async () => {
    const created = await create(USER_A);
    const res = await request(`/api/entry-sheets/${created.id}`, USER_B);

    expect(res.status).toBe(404);
  });
});
