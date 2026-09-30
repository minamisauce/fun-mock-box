/**
 * ES添削ウィザードのステップID。
 *
 * reviewSteps.ts はステップコンポーネントを import するため、コンポーネント側から
 * ステップIDを参照すると循環参照になる。ID だけをこのファイルに分けている。
 */
export const ReviewStepIdEnum = {
  QUESTION: 'question',
  COMPANY_NAME: 'company-name',
  CONTENT: 'content',
} as const;

export type ReviewStepId =
  (typeof ReviewStepIdEnum)[keyof typeof ReviewStepIdEnum];
