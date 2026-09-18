import { createToolForm } from "~/features/ToolWizard/createToolForm";
import { STORAGE_KEYS } from "~/lib/storage";
import type { CreateSelfPromotionRequest } from "~/types/selfPromotion";

export const {
  Provider: SelfPromotionFormProvider,
  useToolForm: useSelfPromotionForm,
} = createToolForm<CreateSelfPromotionRequest>({
  storageKey: STORAGE_KEYS.selfPromotionDraft,
  requiredKeys: ["strength", "situation", "difficulty", "solution"],
  displayName: "useSelfPromotionForm",
});
