import type { SelfPromotionModel } from '@fun/api-schema';
import { beforeEach, describe, expect, it } from 'vitest';
import {
  request,
  requestJson,
  resetDatabase,
  USER_A,
  USER_B,
} from '../../test/request';

const createRequest = {
  strength: '柔軟性',
  situation: '音楽バンドの活動',
  difficulty: 'メンバーとの意見の違い',
  solution: '部員同士の話し合い',
};

function create(anonymousId = USER_A) {
  return requestJson<SelfPromotionModel>('/api/self-promotions', anonymousId, {
    method: 'POST',
    json: createRequest,
  });
}

describe('/api/self-promotions', () => {
  beforeEach(resetDatabase);

  it('匿名IDが無ければ 400', async () => {
    const res = await request('/api/self-promotions', null);
    expect(res.status).toBe(400);
  });

  it('作成すると 201 で ISO8601 の日時を返す', async () => {
    const res = await request('/api/self-promotions', USER_A, {
      method: 'POST',
      json: createRequest,
    });
    expect(res.status).toBe(201);

    const body = (await res.json()) as SelfPromotionModel;
    expect(body.title).not.toBe('');
    expect(new Date(body.created_at).toISOString()).toBe(body.created_at);
  });

  it('作成したものを取得できる', async () => {
    const created = await create();
    const res = await request(`/api/self-promotions/${created.id}`, USER_A);

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(created);
  });

  it('別のユーザーからは取得できない（404）', async () => {
    const created = await create(USER_A);
    const res = await request(`/api/self-promotions/${created.id}`, USER_B);

    expect(res.status).toBe(404);
  });

  it('別のユーザーからは更新できない（404）', async () => {
    const created = await create(USER_A);
    const res = await request(`/api/self-promotions/${created.id}`, USER_B, {
      method: 'PATCH',
      json: { title: '乗っ取り', content: 'x' },
    });
    expect(res.status).toBe(404);

    // 中身も書き換わっていない
    const after = await requestJson<SelfPromotionModel>(
      `/api/self-promotions/${created.id}`,
      USER_A,
    );
    expect(after.title).toBe(created.title);
  });

  it('一覧には自分のものだけが入る', async () => {
    await create(USER_A);
    await create(USER_B);

    const list = await requestJson<SelfPromotionModel[]>(
      '/api/self-promotions',
      USER_A,
    );
    expect(list).toHaveLength(1);
  });

  it('未知のフィールドは 400（strictObject）', async () => {
    const res = await request('/api/self-promotions', USER_A, {
      method: 'POST',
      json: { ...createRequest, evil: 'x' },
    });
    expect(res.status).toBe(400);
  });
});
