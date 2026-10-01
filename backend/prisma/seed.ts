import {
  generateEntrySheetCreate,
  generateMotivation,
  generateSelfPromotion,
} from '@fun/api-schema/generators';
import { prisma } from '../src/shared/prisma';

/**
 * clone 直後に一覧が空だと画面を確認できないので、最小限のデータを入れる。
 * 匿名IDは固定なので、ブラウザの localStorage に同じ値を入れれば見える。
 */
const SEED_ANONYMOUS_ID = '00000000-0000-4000-8000-000000000000';

async function main() {
  const user = await prisma.user.upsert({
    where: { anonymous_id: SEED_ANONYMOUS_ID },
    create: { anonymous_id: SEED_ANONYMOUS_ID },
    update: {},
  });

  const selfPromotion = generateSelfPromotion({
    strength: '柔軟性',
    situation: '音楽バンドの活動',
    difficulty: 'メンバーとの意見の違い',
    solution: '部員同士の話し合い',
  });
  await prisma.selfPromotion.create({
    data: { user_id: user.id, ...selfPromotion },
  });

  const motivation = generateMotivation({
    industry: '金融',
    sector: '銀行',
    reason: '企業の理念やビジョンへの共感',
    experience: 'リーグ優勝に導いた経験',
  });
  await prisma.motivation.create({
    data: { user_id: user.id, ...motivation },
  });

  const entrySheetRequest = {
    question: '学生時代に力を入れたこと',
    company_name: '株式会社サンプル',
    episode: 'カフェでのアルバイト',
  };
  const entrySheet = generateEntrySheetCreate(entrySheetRequest);
  await prisma.entrySheet.create({
    data: {
      user_id: user.id,
      type: 'CREATE',
      question: entrySheetRequest.question,
      company_name: entrySheetRequest.company_name,
      content: entrySheet.content,
      ai_explanation_schema_version: 'CREATE_V1',
      ai_explanation_json: entrySheet.ai_explanation_json,
    },
  });

  console.log(`seeded for anonymous_id=${SEED_ANONYMOUS_ID}`);
}

await main();
