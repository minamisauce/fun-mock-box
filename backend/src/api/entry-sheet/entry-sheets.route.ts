import {
  createEntrySheetRequest,
  idParam,
  reviewEntrySheetRequest,
  updateEntrySheetRequest,
} from '@fun/api-schema';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { badRequest } from '../../shared/errors';
import type { AppEnv } from '../../shared/types';
import { validationErrorHook } from '../../shared/validate';
import { createEntrySheet } from './usecases/create-entry-sheet.usecase';
import { extractEntrySheetText } from './usecases/extract-entry-sheet-text.usecase';
import { getEntrySheet } from './usecases/get-entry-sheet.usecase';
import { getEntrySheetList } from './usecases/get-entry-sheet-list.usecase';
import { reviewEntrySheet } from './usecases/review-entry-sheet.usecase';
import { updateEntrySheet } from './usecases/update-entry-sheet.usecase';

/**
 * 固定パスの POST は :id より先に登録する。
 * app/routes.ts の route("new") と同じ罠なので順序を崩さないこと。
 */
export const entrySheets = new Hono<AppEnv>()
  .get('/', async (c) => c.json(await getEntrySheetList(c.get('userId'))))

  .post(
    '/',
    zValidator('json', createEntrySheetRequest, validationErrorHook),
    async (c) =>
      c.json(await createEntrySheet(c.get('userId'), c.req.valid('json')), 201),
  )

  .post(
    '/review',
    zValidator('json', reviewEntrySheetRequest, validationErrorHook),
    async (c) =>
      c.json(await reviewEntrySheet(c.get('userId'), c.req.valid('json')), 201),
  )

  .post('/extract-text', async (c) => {
    const body = await c.req.parseBody();
    const image = body.image;

    if (!(image instanceof File)) {
      throw badRequest([
        {
          field: 'image',
          message: 'missing_image',
          user_message: '画像が送信されていません。',
        },
      ]);
    }
    return c.json(await extractEntrySheetText(image));
  })

  .get('/:id', zValidator('param', idParam, validationErrorHook), async (c) =>
    c.json(await getEntrySheet(c.get('userId'), c.req.valid('param').id)),
  )

  .patch(
    '/:id',
    zValidator('param', idParam, validationErrorHook),
    zValidator('json', updateEntrySheetRequest, validationErrorHook),
    async (c) =>
      c.json(
        await updateEntrySheet(
          c.get('userId'),
          c.req.valid('param').id,
          c.req.valid('json'),
        ),
      ),
  );
