import {
  difficulty,
  situation,
  solution,
  strength,
} from "~/features/SelfPromotion/constants/inputText";
import type { StepComponentProps } from "~/features/ToolWizard/types";
import { TextInputStep } from "./TextInputStep";

export { SelectStrength } from "./SelectStrength";

export function SelectStrengthOther(props: StepComponentProps) {
  return (
    <TextInputStep
      {...props}
      name="strength"
      placeholder="例）情報収集能力"
      candidates={strength}
    />
  );
}

export function SelectSituation(props: StepComponentProps) {
  return (
    <TextInputStep
      {...props}
      name="situation"
      placeholder="例）音楽バンドの活動"
      candidates={situation}
    />
  );
}

export function SelectDifficulty(props: StepComponentProps) {
  return (
    <TextInputStep
      {...props}
      name="difficulty"
      placeholder="例）メンバーとの意見の違い"
      candidates={difficulty}
    />
  );
}

export function SelectSolution(props: StepComponentProps) {
  return (
    <TextInputStep
      {...props}
      name="solution"
      placeholder="例）部員同士の話し合い"
      candidates={solution}
      submitText="自己PRを作成する"
    />
  );
}
