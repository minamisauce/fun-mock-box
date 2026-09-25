import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { readSession, removeSession, writeSession } from '~/lib/storage';

/**
 * ステップをまたいで入力値を共有する Context を生成するファクトリ。
 *
 * react-hook-form の FormProvider 相当。ツールごとに同じものを書くと
 * shukatsu-box と同じ重複になるため、ここで1本化している。
 * sessionStorage に同期するのでリロードしても入力が残る。
 */

export type ToolFormValue<TForm> = {
  values: Partial<TForm>;
  setValue: (key: keyof TForm, value: string) => void;
  reset: () => void;
  /** 必須項目がすべて埋まっていれば完成したリクエストを返す */
  toRequest: () => TForm | null;
};

export function createToolForm<
  TForm extends Record<string, string | undefined>,
>({
  storageKey,
  requiredKeys,
  displayName,
}: {
  storageKey: string;
  requiredKeys: ReadonlyArray<keyof TForm>;
  displayName: string;
}) {
  const Context = createContext<ToolFormValue<TForm> | null>(null);

  function Provider({ children }: { children: ReactNode }) {
    const [values, setValues] = useState<Partial<TForm>>(() =>
      readSession<Partial<TForm>>(storageKey, {}),
    );

    useEffect(() => {
      writeSession(storageKey, values);
    }, [values]);

    const setValue = useCallback((key: keyof TForm, value: string) => {
      setValues((prev) => ({ ...prev, [key]: value }));
    }, []);

    const reset = useCallback(() => {
      setValues({});
      removeSession(storageKey);
    }, []);

    const toRequest = useCallback((): TForm | null => {
      if (requiredKeys.some((key) => !values[key]?.trim())) return null;
      return Object.fromEntries(
        requiredKeys.map((key) => [key, values[key] ?? '']),
      ) as TForm;
    }, [values]);

    const value = useMemo(
      () => ({ values, setValue, reset, toRequest }),
      [values, setValue, reset, toRequest],
    );

    return <Context.Provider value={value}>{children}</Context.Provider>;
  }

  function useToolForm(): ToolFormValue<TForm> {
    const context = useContext(Context);
    if (!context) {
      throw new Error(`${displayName} は Provider の内側で使ってください`);
    }
    return context;
  }

  return { Provider, useToolForm };
}
