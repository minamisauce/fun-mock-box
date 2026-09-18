import { redirect } from "react-router";
import { StepIdEnum } from "~/features/SelfPromotion/constants/stepIds";
import { paths } from "~/lib/paths";

/** /self-promotions/new は先頭ステップへ送るだけ */
export function clientLoader() {
  return redirect(paths.selfPromotionsNewStep(StepIdEnum.STRENGTH));
}

export default function SelfPromotionNewIndex() {
  return null;
}
