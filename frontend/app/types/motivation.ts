/**
 * 志望動機作成ツールのドメイン型。
 *
 * 実体は @fun/api-schema（FE/BE 共有）にある。ここは薄い再エクスポート層。
 * 本番同様 adjust（AIで調整）API は存在しない。
 */
export type {
  CreateMotivationRequest,
  MotivationModel,
  UpdateMotivationRequest,
} from '@fun/api-schema';
