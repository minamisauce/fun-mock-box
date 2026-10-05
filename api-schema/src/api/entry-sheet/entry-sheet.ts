import * as z from 'zod';

/**
 * ES作成・添削ツールの API スキーマ。
 *
 * 自己PR・志望動機と違い、ES はウィザードではなく1画面フォームで、
 * CREATE（作成）と REVIEW（添削）の2モードがある。
 */

export const entrySheetType = z.enum(['CREATE', 'REVIEW']);
export type EntrySheetType = z.infer<typeof entrySheetType>;

/** AI解説（作成時）: 良く書けている点の解説 */
export const aiExplanationCreateV1 = z.array(
  z.object({
    /** 例: 強みの明確化 */
    title: z.string(),
    content: z.string(),
  }),
);
export type AiExplanationCreateV1 = z.infer<typeof aiExplanationCreateV1>;

/** AI解説（添削時）: 修正前後とコメント。本番は最大3件 */
export const aiExplanationReviewV1 = z.array(
  z.object({
    /** 例: 成果の数値化 */
    title: z.string(),
    before: z.string(),
    after: z.string(),
    comment: z.string(),
  }),
);
export type AiExplanationReviewV1 = z.infer<typeof aiExplanationReviewV1>;

const entrySheetBase = {
  id: z.uuid(),
  created_at: z.iso.datetime(),
  updated_at: z.iso.datetime(),
  question: z.string().min(1),
  company_name: z.string().min(1),
  content: z.string().min(1),
  /** 添削前の内容（添削のときのみ） */
  original_content: z.string().optional(),
};

const entrySheetCreateModel = z.object({
  ...entrySheetBase,
  type: z.literal('CREATE'),
  /**
   * 作成時に指定された文字数。未指定なら持たない。
   * 生成のパラメータであると同時に、結果画面で「何文字以内で作ったか」を
   * 示すためにも使うので、モデルに残す。添削には無い概念なので CREATE のみ。
   */
  character_limit: z.number().int().positive().optional(),
  ai_explanation_schema_version: z.literal('CREATE_V1'),
  ai_explanation_json: aiExplanationCreateV1,
});
export type EntrySheetCreateModel = z.infer<typeof entrySheetCreateModel>;

const entrySheetReviewModel = z.object({
  ...entrySheetBase,
  type: z.literal('REVIEW'),
  ai_explanation_schema_version: z.literal('REVIEW_V1'),
  ai_explanation_json: aiExplanationReviewV1,
});
export type EntrySheetReviewModel = z.infer<typeof entrySheetReviewModel>;

/** ai_explanation_schema_version による discriminated union（本番と同じ） */
const entrySheetModel = z.discriminatedUnion('ai_explanation_schema_version', [
  entrySheetCreateModel,
  entrySheetReviewModel,
]);
export type EntrySheetModel = z.infer<typeof entrySheetModel>;

// GET /api/entry-sheets
export type GetEntrySheetListResponse = EntrySheetModel[];

// GET /api/entry-sheets/:id
export type GetEntrySheetResponse = EntrySheetModel;

// POST /api/entry-sheets
export const createEntrySheetRequest = z.strictObject({
  question: z.string().min(1),
  company_name: z.string().min(1),
  /** 文字数制限 例: 400 */
  character_limit: z.number().int().positive().optional(),
  episode: z.string().min(1),
  inflow_source: z.string().optional(),
  /** ブラウザ内LLMで生成済みの本文と解説。自己PRの generated と同じ扱い */
  generated: z
    .strictObject({
      content: z.string().min(1),
      ai_explanation_json: aiExplanationCreateV1,
    })
    .optional(),
});
export type CreateEntrySheetRequest = z.infer<typeof createEntrySheetRequest>;
export type CreateEntrySheetResponse = EntrySheetModel;

// POST /api/entry-sheets/review
export const reviewEntrySheetRequest = z.strictObject({
  question: z.string().min(1),
  company_name: z.string().min(1),
  /** 添削前のエントリーシート内容 */
  original_content: z.string().min(1),
  inflow_source: z.string().optional(),
  /** ブラウザ内LLMで生成済みの本文と解説。作成の generated と同じ扱い */
  generated: z
    .strictObject({
      content: z.string().min(1),
      ai_explanation_json: aiExplanationReviewV1,
    })
    .optional(),
});
export type ReviewEntrySheetRequest = z.infer<typeof reviewEntrySheetRequest>;
export type ReviewEntrySheetResponse = EntrySheetModel;

// PATCH /api/entry-sheets/:id
export const updateEntrySheetRequest = z.strictObject({
  content: z.string().min(1),
});
export type UpdateEntrySheetRequest = z.infer<typeof updateEntrySheetRequest>;
export type UpdateEntrySheetResponse = EntrySheetModel;

/**
 * POST /api/entry-sheets/extract-text のレスポンス。
 *
 * ES の画像には設問や企業名も写っていることが多いので、本文だけでなく
 * フォーム全体を埋められる形で返す。読み取れなかった項目は省略される。
 */
export const extractedEntrySheet = z.object({
  question: z.string().optional(),
  company_name: z.string().optional(),
  content: z.string(),
});
export type ExtractedEntrySheet = z.infer<typeof extractedEntrySheet>;
export type ExtractEntrySheetTextResponse = ExtractedEntrySheet;
