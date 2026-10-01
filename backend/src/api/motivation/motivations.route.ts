import {
  createMotivationRequest,
  idParam,
  updateMotivationRequest,
} from '@fun/api-schema';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import type { AppEnv } from '../../shared/types';
import { validationErrorHook } from '../../shared/validate';
import { createMotivation } from './usecases/create-motivation.usecase';
import { getMotivation } from './usecases/get-motivation.usecase';
import { getMotivationList } from './usecases/get-motivation-list.usecase';
import { updateMotivation } from './usecases/update-motivation.usecase';

export const motivations = new Hono<AppEnv>()
  .get('/', async (c) => c.json(await getMotivationList(c.get('userId'))))

  .post(
    '/',
    zValidator('json', createMotivationRequest, validationErrorHook),
    async (c) =>
      c.json(await createMotivation(c.get('userId'), c.req.valid('json')), 201),
  )

  .get('/:id', zValidator('param', idParam, validationErrorHook), async (c) =>
    c.json(await getMotivation(c.get('userId'), c.req.valid('param').id)),
  )

  .patch(
    '/:id',
    zValidator('param', idParam, validationErrorHook),
    zValidator('json', updateMotivationRequest, validationErrorHook),
    async (c) =>
      c.json(
        await updateMotivation(
          c.get('userId'),
          c.req.valid('param').id,
          c.req.valid('json'),
        ),
      ),
  );
