import type { MotivationModel } from '@fun/api-schema';
import { beforeEach, describe, expect, it } from 'vitest';
import {
  request,
  requestJson,
  resetDatabase,
  USER_A,
  USER_B,
} from '../../test/request';

const createRequest = {
  industry: '金融',
  sector: '銀行',
  reason: '企業の理念やビジョンへの共感',
  experience: 'リーグ優勝に導いた経験',
};

function create(anonymousId = USER_A) {
  return requestJson<MotivationModel>('/api/motivations', anonymousId, {
    method: 'POST',
    json: createRequest,
  });
}

describe('/api/motivations', () => {
  beforeEach(resetDatabase);

  it('作成したものを取得できる', async () => {
    const created = await create();
    const res = await request(`/api/motivations/${created.id}`, USER_A);

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(created);
  });

  it('生成済みの本文（generated）があればそれを保存する', async () => {
    const body = await requestJson<MotivationModel>(
      '/api/motivations',
      USER_A,
      {
        method: 'POST',
        json: {
          ...createRequest,
          generated: { title: 'LLMのタイトル', content: 'LLMの本文' },
        },
      },
    );
    expect(body.title).toBe('LLMのタイトル');
    expect(body.content).toBe('LLMの本文');
  });

  it('別のユーザーからは取得できない（404）', async () => {
    const created = await create(USER_A);
    const res = await request(`/api/motivations/${created.id}`, USER_B);

    expect(res.status).toBe(404);
  });

  it('自己PRとは別の一覧になる', async () => {
    await create(USER_A);

    expect(
      await requestJson<MotivationModel[]>('/api/motivations', USER_A),
    ).toHaveLength(1);
    expect(
      await requestJson<unknown[]>('/api/self-promotions', USER_A),
    ).toHaveLength(0);
  });
});
