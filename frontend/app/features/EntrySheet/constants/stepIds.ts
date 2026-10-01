/**
 * ESウィザードのステップID。
 *
 * createSteps.ts / reviewSteps.ts はステップコンポーネントを import するため、
 * コンポーネント側からステップIDを参照すると循環参照になる。
 * ID だけをこのファイルに分けている。
 */
export const CreateStepIdEnum = {
  QUESTION: 'question',
  COMPANY_NAME: 'company-name',
  CHARACTER_LIMIT: 'character-limit',
  EPISODE: 'episode',
} as const;

export type CreateStepId =
  (typeof CreateStepIdEnum)[keyof typeof CreateStepIdEnum];

export const ReviewStepIdEnum = {
  QUESTION: 'question',
  COMPANY_NAME: 'company-name',
  CONTENT: 'content',
} as const;

export type ReviewStepId =
  (typeof ReviewStepIdEnum)[keyof typeof ReviewStepIdEnum];
