import { createToolForm } from "~/features/ToolWizard/createToolForm";
import { STORAGE_KEYS } from "~/lib/storage";
import type { CreateMotivationRequest } from "~/types/motivation";

export const {
  Provider: MotivationFormProvider,
  useToolForm: useMotivationForm,
} = createToolForm<CreateMotivationRequest>({
  storageKey: STORAGE_KEYS.motivationDraft,
  requiredKeys: ["industry", "sector", "reason", "experience"],
  displayName: "useMotivationForm",
});
