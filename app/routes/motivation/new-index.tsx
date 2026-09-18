import { redirect } from "react-router";
import { StepIdEnum } from "~/features/Motivation/constants/stepIds";
import { paths } from "~/lib/paths";

/** /motivations/new は先頭ステップへ送るだけ */
export function clientLoader() {
  return redirect(paths.motivationsNewStep(StepIdEnum.INDUSTRY));
}

export default function MotivationNewIndex() {
  return null;
}
