/**
 * ステップ ID。
 * steps.ts はステップコンポーネントを import するため、
 * コンポーネント側から ID を参照すると循環参照になる。ID だけを分離している。
 */
export const StepIdEnum = {
  INDUSTRY: "industry",
  SECTOR: "sector",
  REASON: "reason",
  EXPERIENCE: "experience",
} as const;

export type StepId = (typeof StepIdEnum)[keyof typeof StepIdEnum];
