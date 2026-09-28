/**
 * 自己PR作成ツールのドメイン型。
 *
 * 実体は @fun/api-schema（FE/BE 共有）にある。ここは薄い再エクスポート層で、
 * FE でしか使わない型を足したいときだけこのファイルに書く。
 */
export type {
  CreateSelfPromotionRequest,
  SelfPromotionModel,
  UpdateSelfPromotionRequest,
} from '@fun/api-schema';
