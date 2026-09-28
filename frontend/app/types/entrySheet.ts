import type { ExtractedEntrySheet } from '@fun/api-schema';

/**
 * ES作成・添削ツールのドメイン型。
 *
 * 実体は @fun/api-schema（FE/BE 共有）にある。ここは薄い再エクスポート層で、
 * FE でしか使わない型を足したいときだけこのファイルに書く。
 */
export type {
  AiExplanationCreateV1,
  AiExplanationReviewV1,
  CreateEntrySheetRequest,
  EntrySheetCreateModel,
  EntrySheetModel,
  EntrySheetReviewModel,
  EntrySheetType,
  ExtractedEntrySheet,
  ReviewEntrySheetRequest,
  UpdateEntrySheetRequest,
} from '@fun/api-schema';

/** 画像から自動入力された項目（ユーザーに確認を促すため印を付ける） */
export type ExtractedField = keyof ExtractedEntrySheet;
