import { useEffect, useMemo } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router";
import type { Step, Steps } from "~/features/SelfPromotion/types";
import type { CreateSelfPromotionRequest } from "~/types/selfPromotion";

function findStepById(steps: Steps, id: string | undefined): Step | undefined {
  const found = steps.find((s) =>
    Array.isArray(s) ? s.some((ss) => ss.id === id) : s.id === id,
  );
  if (Array.isArray(found)) {
    return found.find((s) => s.id === id);
  }
  return found;
}

/**
 * 次のステップを取得する。
 * 次が分岐ステップ（配列）の場合:
 *   1. nextId が指定されていればその id のステップ
 *   2. 指定がない/見つからない場合は配列の先頭
 */
function getNextStep(steps: Steps, nextIndex: number, nextId?: string): Step {
  const next = steps[nextIndex];
  if (Array.isArray(next)) {
    return next.find((s) => s.id === nextId) ?? next[0];
  }
  return next;
}

/**
 * ウィザードのステップ遷移を一元管理する。
 * 出典: shukatsu-box/frontend/app/src/features/Motivation/hooks/useStepNavigation.ts
 */
export function useStepNavigation(steps: Steps, basePath: string) {
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
  const withSearchParams = (path: string) => {
    const query = searchParams.toString();
    return query ? `${path}?${query}` : path;
  };

  // 未知の step が指定されたら先頭ステップへ戻す
  useEffect(() => {
    if (currentStepObject) return;
    const defaultStep = getNextStep(steps, 0);
    const query = searchParams.toString();
    const path = `${basePath}/${defaultStep.id}`;
    navigate(query ? `${path}?${query}` : path, { replace: true });
  }, [currentStepObject, steps, basePath, navigate, searchParams]);

  const handleNextStep = (nextId?: string) => {
    if (currentStep < 0 || currentStep >= steps.length - 1) return;
    const next = getNextStep(steps, currentStep + 1, nextId);
    navigate(withSearchParams(`${basePath}/${next.id}`));
  };

  const getLatestStepIds = (): string[] => {
    const latest = steps[steps.length - 1];
    return Array.isArray(latest) ? latest.map((s) => s.id) : [latest.id];
  };

  const getRequiredParams = (): Array<keyof CreateSelfPromotionRequest> =>
    currentStepObject?.requiredParams ?? [];

  const isLastStep = currentStep === steps.length - 1;

  return {
    currentStep,
    currentStepObject,
    isLastStep,
    handleNextStep,
    getLatestStepIds,
    getRequiredParams,
  };
}
