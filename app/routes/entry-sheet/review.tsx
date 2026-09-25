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
import { reviewEntrySheet } from "~/mocks/entrySheet";

const GENERATING_MESSAGES = [
  "文章を読み込んでいます…",
  "改善点を洗い出しています…",
  "添削案を作成しています…",
] as const;

const theme = TOOL_THEME["entry-sheet"];

export function meta() {
  return [{ title: "ES添削 | fun-mock-box" }];
}

export default function EntrySheetReview() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (values: EntrySheetFormValues) => {
    setIsSubmitting(true);
    try {
      const created = await reviewEntrySheet({
        question: values.question,
        company_name: values.company_name,
        original_content: values.original_content,
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
          mode="REVIEW"
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
