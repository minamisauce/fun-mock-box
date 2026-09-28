import type {
  CreateEntrySheetRequest,
  EntrySheetModel,
  ExtractedEntrySheet,
  ReviewEntrySheetRequest,
  UpdateEntrySheetRequest,
} from '~/types/entrySheet';
import type {
  CreateMotivationRequest,
  MotivationModel,
  UpdateMotivationRequest,
} from '~/types/motivation';
import type {
  CreateSelfPromotionRequest,
  SelfPromotionModel,
  UpdateSelfPromotionRequest,
} from '~/types/selfPromotion';

/**
 * データアクセスの契約。
 *
 * この1つの型を localStorage 実装（`local/`）と HTTP 実装（`http/`）の
 * 両方が満たす。片方にメソッドを足すともう片方が型エラーになるので、
 * 2実装がズレたままマージされることはない。
 *
 * 振る舞いのズレは `contract.test.ts` が両実装に同じテストを流して落とす。
 *
 * 規約:
 * - 全メソッドが Promise を返す（同期に見える実装を作らない）
 * - `get` は見つからなければ throw せず `null`。「ロード中 / 見つからない / 失敗」を
 *   呼び出し側が3状態で書けるようにするため
 * - `update` の存在しない id は `DataError { kind: 'not_found' }` で reject。
 *   取得と違い「あるはずのものが無い」異常なので握り潰さない
 */

/** 自己PR・志望動機のように「一覧・取得・作成・更新」で表せるリソース */
export type ToolResource<TModel, TCreate, TUpdate> = {
  /** 新しいものが先頭 */
  list(signal?: AbortSignal): Promise<TModel[]>;
  get(id: string, signal?: AbortSignal): Promise<TModel | null>;
  create(req: TCreate): Promise<TModel>;
  update(id: string, patch: TUpdate): Promise<TModel>;
};

export type DataClient = {
  selfPromotions: ToolResource<
    SelfPromotionModel,
    CreateSelfPromotionRequest,
    UpdateSelfPromotionRequest
  >;
  motivations: ToolResource<
    MotivationModel,
    CreateMotivationRequest,
    UpdateMotivationRequest
  >;
  entrySheets: ToolResource<
    EntrySheetModel,
    CreateEntrySheetRequest,
    UpdateEntrySheetRequest
  > & {
    /** AIによるES添削。作成と同じ一覧に並ぶ */
    review(req: ReviewEntrySheetRequest): Promise<EntrySheetModel>;
    /** 画像からの内容抽出。結果は保存せずフォームに流すだけ */
    extractFromImage(file: File): Promise<ExtractedEntrySheet>;
  };
};
