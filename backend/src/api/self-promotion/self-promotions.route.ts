import {
  createSelfPromotionRequest,
  idParam,
  updateSelfPromotionRequest,
} from '@fun/api-schema';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import type { AppEnv } from '../../shared/types';
import { validationErrorHook } from '../../shared/validate';
import { createSelfPromotion } from './usecases/create-self-promotion.usecase';
import { getSelfPromotion } from './usecases/get-self-promotion.usecase';
import { getSelfPromotionList } from './usecases/get-self-promotion-list.usecase';
import { updateSelfPromotion } from './usecases/update-self-promotion.usecase';

export const selfPromotions = new Hono<AppEnv>()
  .get('/', async (c) => c.json(await getSelfPromotionList(c.get('userId'))))

  .post(
    '/',
    zValidator('json', createSelfPromotionRequest, validationErrorHook),
    async (c) =>
      c.json(
        await createSelfPromotion(c.get('userId'), c.req.valid('json')),
        201,
      ),
  )

  .get('/:id', zValidator('param', idParam, validationErrorHook), async (c) =>
    c.json(await getSelfPromotion(c.get('userId'), c.req.valid('param').id)),
  )

  .patch(
    '/:id',
    zValidator('param', idParam, validationErrorHook),
    zValidator('json', updateSelfPromotionRequest, validationErrorHook),
    async (c) =>
      c.json(
        await updateSelfPromotion(
          c.get('userId'),
          c.req.valid('param').id,
          c.req.valid('json'),
        ),
      ),
  );
