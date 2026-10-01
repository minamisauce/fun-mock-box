import type { ComponentType } from 'react';

/**
 * 3ツール（自己PR / 志望動機 / ES）共通のウィザード型。
 * 特定ツールのリクエスト型に依存しないよう TForm でパラメータ化している。
 */

export type StepComponentProps = {
  label: string;
  /** 次のステップへ進む。最終ステップでは送信処理が差し込まれる */
  handleNextStep: () => void;
  /**
   * 最終ステップを待たずに送信する。
   *
   * ES の「画像から一括入力」のように、途中のステップで必要な値がすべて揃う
   * 経路のためにある。フォームへ値を入れた直後に呼ぶと state がまだ更新前なので、
   * 呼び出し側は setValue の次のレンダーまで待つこと（createSteps の例を参照）。
   */
  handleSubmit?: () => void;
  isSubmitting?: boolean;
};

export type Step<TForm> = {
  id: string;
  component: ComponentType<StepComponentProps>;
  label: string;
  /** これらが未入力なら先頭ステップへ戻す（直リンク・ブラウザバック対策） */
  requiredParams: Array<keyof TForm>;
};

/**
 * ネストした配列は「同一階層の分岐ステップ」を表す。
 * 例: [strength, strength-other] は進捗上どちらも1ステップ目として扱われる。
 * 分岐先への遷移はステップコンポーネント側が直接 navigate する。
 */
export type Steps<TForm> = Array<Step<TForm> | Array<Step<TForm>>>;
