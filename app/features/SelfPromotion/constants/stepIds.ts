/**
 * ステップ ID。
 * steps.ts はステップコンポーネントを import するため、
 * コンポーネント側から ID を参照すると循環参照になる。
 * ID だけをこのモジュールに分離している。
 */
export const StepIdEnum = {
  STRENGTH: "strength",
  STRENGTH_OTHER: "strength-other",
  SITUATION: "situation",
  DIFFICULTY: "difficulty",
  SOLUTION: "solution",
} as const;

export type StepId = (typeof StepIdEnum)[keyof typeof StepIdEnum];
