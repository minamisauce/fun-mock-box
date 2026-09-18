import type { ComponentType } from "react";
import type { CreateSelfPromotionRequest } from "~/types/selfPromotion";

export type StepComponentProps = {
  label: string;
  /** 次のステップへ進む。分岐ステップでは遷移先 id を渡す */
  handleNextStep: (nextId?: string) => void;
  /** 最終ステップの送信中 */
  isSubmitting?: boolean;
};

export type Step = {
  id: string;
  component: ComponentType<StepComponentProps>;
  label: string;
  /** これらが未入力なら先頭ステップへ戻す（直リンク・ブラウザバック対策） */
  requiredParams: Array<keyof CreateSelfPromotionRequest>;
};

/**
 * ネストした配列は「同一階層の分岐ステップ」を表す。
 * 例: [strength, strength-other] は同じ1ステップ目で、
 * 「その他」を選んだときだけ strength-other に進む。
 */
export type Steps = Array<Step | Step[]>;
