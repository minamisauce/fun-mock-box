/**
 * 志望動機作成ツールのドメイン型。
 *
 * shukatsu-box の api-schema/src/api/motivation/motivation.ts と
 * フィールド名を完全に揃えている。
 *
 * NOTE: 自己PR・ES と違い、志望動機に adjust（AIで調整）API は存在しない。
 */

export type CreateMotivationRequest = {
  /** 志望業界 例: 金融 */
  industry: string;
  /** 志望業種 例: 銀行 */
  sector: string;
  /** 志望理由 例: 企業の理念やビジョンへの共感 */
  reason: string;
  /** どんな経験から働きたいと思ったか 例: リーグ優勝に導いた経験 */
  experience: string;
  inflow_source?: string;
};

export type MotivationModel = {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
};

export type UpdateMotivationRequest = {
  title: string;
  content: string;
};
