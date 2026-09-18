import { useCallback, useEffect, useMemo } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router";
import type { Step, Steps } from "~/features/ToolWizard/types";

function findStepById<TForm>(
  steps: Steps<TForm>,
  id: string | undefined,
): Step<TForm> | undefined {
  const found = steps.find((s) =>
    Array.isArray(s) ? s.some((ss) => ss.id === id) : s.id === id,
  );
  return Array.isArray(found) ? found.find((s) => s.id === id) : found;
}

/** 分岐ステップ（配列）の場合は先頭を既定とする */
function getStepAt<TForm>(steps: Steps<TForm>, index: number): Step<TForm> {
  const target = steps[index];
  return Array.isArray(target) ? target[0] : target;
}

/**
 * ウィザードのステップ遷移を一元管理する。
 * 特定ツールに依存しないので、志望動機・ES でもそのまま使う。
 *
 * 出典: shukatsu-box/frontend/app/src/features/Motivation/hooks/useStepNavigation.ts
 */
export function useStepNavigation<TForm>(
  steps: Steps<TForm>,
  basePath: string,
) {
  const { step } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const currentStep = useMemo(
    () =>
      steps.findIndex((s) =>
        Array.isArray(s) ? s.some((ss) => ss.id === step) : s.id === step,
      ),
    [step, steps],
  );

  const currentStepObject = useMemo(
    () => findStepById(steps, step),
    [step, steps],
  );

  // 遷移してもクエリパラメータ（inflow_source 等）を落とさない
  const buildPath = useCallback(
    (stepId: string) => {
      const query = searchParams.toString();
      const path = `${basePath}/${stepId}`;
      return query ? `${path}?${query}` : path;
    },
    [basePath, searchParams],
  );

  // 未知の step が指定されたら先頭ステップへ戻す
  useEffect(() => {
    if (currentStepObject) return;
    navigate(buildPath(getStepAt(steps, 0).id), { replace: true });
  }, [currentStepObject, steps, navigate, buildPath]);

  const handleNextStep = useCallback(() => {
    if (currentStep < 0 || currentStep >= steps.length - 1) return;
    navigate(buildPath(getStepAt(steps, currentStep + 1).id));
  }, [currentStep, steps, navigate, buildPath]);

  const isLastStep = currentStep === steps.length - 1;

  return { currentStep, currentStepObject, isLastStep, handleNextStep };
}
