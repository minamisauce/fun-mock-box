import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  readSession,
  removeSession,
  STORAGE_KEYS,
  writeSession,
} from "~/lib/storage";
import type { CreateSelfPromotionRequest } from "~/types/selfPromotion";

export type SelfPromotionDraft = Partial<CreateSelfPromotionRequest>;

type ContextValue = {
  values: SelfPromotionDraft;
  setValue: (
    key: keyof CreateSelfPromotionRequest,
    value: string,
  ) => void;
  reset: () => void;
  /** 4項目すべて埋まっていれば完成したリクエストを返す */
  toRequest: () => CreateSelfPromotionRequest | null;
};

const SelfPromotionFormContext = createContext<ContextValue | null>(null);

const REQUIRED_KEYS = [
  "strength",
  "situation",
  "difficulty",
  "solution",
] as const satisfies ReadonlyArray<keyof CreateSelfPromotionRequest>;

/**
 * ステップをまたいで入力値を共有する。
 * react-hook-form の FormProvider 相当を Context + useState で置き換えたもの。
 * sessionStorage に同期することでリロードしても入力が残る。
 */
export function SelfPromotionFormProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [values, setValues] = useState<SelfPromotionDraft>(() =>
    readSession<SelfPromotionDraft>(STORAGE_KEYS.selfPromotionDraft, {}),
  );

  useEffect(() => {
    writeSession(STORAGE_KEYS.selfPromotionDraft, values);
  }, [values]);

  const setValue = useCallback(
    (key: keyof CreateSelfPromotionRequest, value: string) => {
      setValues((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const reset = useCallback(() => {
    setValues({});
    removeSession(STORAGE_KEYS.selfPromotionDraft);
  }, []);

  const toRequest = useCallback((): CreateSelfPromotionRequest | null => {
    const missing = REQUIRED_KEYS.some((key) => !values[key]?.trim());
    if (missing) return null;
    return {
      strength: values.strength ?? "",
      situation: values.situation ?? "",
      difficulty: values.difficulty ?? "",
      solution: values.solution ?? "",
    };
  }, [values]);

  const value = useMemo(
    () => ({ values, setValue, reset, toRequest }),
    [values, setValue, reset, toRequest],
  );

  return (
    <SelfPromotionFormContext.Provider value={value}>
      {children}
    </SelfPromotionFormContext.Provider>
  );
}

export function useSelfPromotionForm(): ContextValue {
  const context = useContext(SelfPromotionFormContext);
  if (!context) {
    throw new Error(
      "useSelfPromotionForm は SelfPromotionFormProvider の内側で使ってください",
    );
  }
  return context;
}
