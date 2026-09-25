import { useState } from "react";
import { useNavigate } from "react-router";
import { GeneratingOverlay } from "~/components/GeneratingOverlay";
import { ToolLayout } from "~/components/ToolLayout";
import {
  EntrySheetForm,
  type EntrySheetFormValues,
} from "~/features/EntrySheet/components/EntrySheetForm";
import { paths } from "~/lib/paths";
import { TOOL_THEME } from "~/lib/toolTheme";
import { createEntrySheet } from "~/mocks/entrySheet";

const GENERATING_MESSAGES = [
  "設問とエピソードを読み取っています…",
  "構成を組み立てています…",
  "文章を作成しています…",
] as const;

const theme = TOOL_THEME["entry-sheet"];

export function meta() {
  return [{ title: "ES作成 | fun-mock-box" }];
}

export default function EntrySheetCreate() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (values: EntrySheetFormValues) => {
    setIsSubmitting(true);
    try {
      const created = await createEntrySheet({
        question: values.question,
        company_name: values.company_name,
        episode: values.episode,
        character_limit: values.character_limit
          ? Number(values.character_limit)
          : undefined,
      });
      navigate(paths.entrySheet(created.id), { replace: true });
    } catch (error) {
      console.error(error);
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <ToolLayout title="ES作成・添削" onBack={() => navigate(paths.home)}>
        <EntrySheetForm
          mode="CREATE"
          isSubmitting={isSubmitting}
          onSubmit={handleSubmit}
        />
      </ToolLayout>

      <GeneratingOverlay
        isOpen={isSubmitting}
        messages={GENERATING_MESSAGES}
        theme={theme}
      />
    </>
  );
}
