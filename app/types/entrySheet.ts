/**
 * ES作成・添削ツールのドメイン型。
 *
 * shukatsu-box の api-schema/src/api/entry-sheet/entry-sheet.ts と
 * フィールド名を完全に揃えている。
 *
 * NOTE: 自己PR・志望動機と違い、ES はウィザードではなく1画面フォーム。
 *       さらに CREATE（作成）と REVIEW（添削）の2モードがある。
 */

export type EntrySheetType = "CREATE" | "REVIEW";

/** AI解説（作成時）: 良く書けている点の解説 */
export type AiExplanationCreateV1 = Array<{
  /** 例: 強みの明確化 */
  title: string;
  content: string;
}>;

/** AI解説（添削時）: 修正前後とコメント。本番は最大3件 */
export type AiExplanationReviewV1 = Array<{
  /** 例: 成果の数値化 */
  title: string;
  before: string;
  after: string;
  comment: string;
}>;

type EntrySheetBase = {
  id: string;
  created_at: string;
  updated_at: string;
  type: EntrySheetType;
  question: string;
  company_name: string;
  content: string;
  /** 添削前の内容（添削のときのみ） */
  original_content?: string;
};

export type EntrySheetCreateModel = EntrySheetBase & {
  type: "CREATE";
  ai_explanation_schema_version: "CREATE_V1";
  ai_explanation_json: AiExplanationCreateV1;
};

export type EntrySheetReviewModel = EntrySheetBase & {
  type: "REVIEW";
  ai_explanation_schema_version: "REVIEW_V1";
  ai_explanation_json: AiExplanationReviewV1;
};

/** ai_explanation_schema_version による discriminated union（本番と同じ） */
export type EntrySheetModel = EntrySheetCreateModel | EntrySheetReviewModel;

export type CreateEntrySheetRequest = {
  question: string;
  company_name: string;
  /** 文字数制限 例: 400 */
  character_limit?: number;
  episode: string;
  inflow_source?: string;
};

export type ReviewEntrySheetRequest = {
  question: string;
  company_name: string;
  /** 添削前のエントリーシート内容 */
  original_content: string;
  inflow_source?: string;
};

export type UpdateEntrySheetRequest = {
  content: string;
};

/**
 * 画像から読み取った内容。
 * ES の画像には設問や企業名も写っていることが多いので、本文だけでなく
 * フォーム全体を埋められる形で返す。写っていない項目は undefined。
 */
export type ExtractedEntrySheet = {
  question?: string;
  company_name?: string;
  content: string;
};

/** 画像から自動入力された項目（ユーザーに確認を促すため印を付ける） */
export type ExtractedField = keyof ExtractedEntrySheet;
