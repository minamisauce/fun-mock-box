import { useCallback, useEffect, useRef, useState } from 'react';
import { reportError } from '~/data/errors';
import type { LlmModelId } from '~/features/LocalLlm/constants';
import {
  type ChatMessage,
  interrupt,
  isModelCached,
  isModelLoaded,
  loadModel,
  streamChat,
} from '~/features/LocalLlm/engine';
import { LlmError, toLlmError } from '~/features/LocalLlm/errors';
import { useSelectedModel } from '~/features/LocalLlm/hooks/useSelectedModel';
import { stripThinking } from '~/features/LocalLlm/text';

/**
 * 1回の「生成」で何をするか。ツールごとに用意する。
 *
 * - messages: 本文のプロンプト。この出力が画面にストリーミングされる
 * - finalize: 流し終えた本文から保存する値を作る。解説のように
 *   追加の生成が要るなら complete を呼ぶ。形が合わなければ
 *   LlmError('parse') を投げる
 */
export type LlmTask<T> = {
  messages: ChatMessage[];
  finalize: (text: string, ctx: FinalizeContext) => T | Promise<T>;
};

export type FinalizeContext = {
  /** 画面には流さずに、もう1回生成して全文を返す */
  complete: (messages: ChatMessage[]) => Promise<string>;
};

/** 再生成するたびに増える「案」。同じ入力でも出力が揺れるので並べて比べる */
export type Candidate<T> = {
  text: string;
  /** finalize まで終わった値。生成中・停止したものは null */
  result: T | null;
  stopped: boolean;
  modelId: LlmModelId;
};

export type LlmPhase =
  | { kind: 'idle' }
  /** 重みが端末に無い。ダウンロードしてよいか確認する */
  | { kind: 'confirm-download' }
  | { kind: 'loading'; progress: number; text: string }
  | { kind: 'generating' }
  /** 本文は出た。解説など、追加の生成をしている */
  | { kind: 'finalizing' }
  | { kind: 'ready' }
  | { kind: 'error'; error: LlmError };

/**
 * ブラウザ内LLMでの生成の状態機械。
 *
 *   idle → (confirm-download) → loading → generating → (finalizing) → ready
 *                                              ↓ 停止           ↓ 失敗
 *                                            ready            error
 *
 * 「もう一度生成」では candidates に案を1つ足す。前の案は消さない。
 */
export function useLocalLlm<T>() {
  const [modelId, setModelId] = useSelectedModel();
  const [phase, setPhase] = useState<LlmPhase>({ kind: 'idle' });
  const [candidates, setCandidates] = useState<Candidate<T>[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const taskRef = useRef<LlmTask<T> | null>(null);
  const countRef = useRef(0);
  const busyRef = useRef(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      // 画面を離れたら生成を止める。止めないと Worker が回り続ける
      if (busyRef.current) interrupt();
    };
  }, []);

  const safeSetPhase = useCallback((next: LlmPhase) => {
    if (mountedRef.current) setPhase(next);
  }, []);

  const updateCandidate = useCallback(
    (index: number, patch: (c: Candidate<T>) => Candidate<T>) => {
      if (!mountedRef.current) return;
      setCandidates((prev) => prev.map((c, i) => (i === index ? patch(c) : c)));
    },
    [],
  );

  /** モデルを読み込み（済みなら飛ばして）、案を1つ生成する */
  const run = useCallback(
    async (targetModelId: LlmModelId) => {
      const task = taskRef.current;
      if (!task || busyRef.current) return;
      busyRef.current = true;
      let index = -1;

      try {
        if (!isModelLoaded(targetModelId)) {
          safeSetPhase({ kind: 'loading', progress: 0, text: '' });
          await loadModel(targetModelId, ({ progress, text }) =>
            safeSetPhase({ kind: 'loading', progress, text }),
          );
        }

        index = countRef.current;
        countRef.current += 1;
        if (mountedRef.current) {
          setCandidates((prev) => [
            ...prev,
            { text: '', result: null, stopped: false, modelId: targetModelId },
          ]);
          setSelectedIndex(index);
        }
        safeSetPhase({ kind: 'generating' });

        const { text, stopped } = await streamChat(
          targetModelId,
          task.messages,
          {
            onDelta: (delta) =>
              updateCandidate(index, (c) => ({ ...c, text: c.text + delta })),
          },
        );

        if (stopped) {
          updateCandidate(index, (c) => ({ ...c, stopped: true }));
          safeSetPhase({ kind: 'ready' });
          return;
        }

        safeSetPhase({ kind: 'finalizing' });
        const result = await task.finalize(text, {
          complete: async (messages) => {
            const extra = await streamChat(targetModelId, messages, {
              onDelta: () => undefined,
            });
            if (extra.stopped) throw new LlmError('parse', 'stopped');
            return stripThinking(extra.text);
          },
        });
        updateCandidate(index, (c) => ({ ...c, result }));
        safeSetPhase({ kind: 'ready' });
      } catch (e) {
        reportError(e);
        // 書きかけの案は残さない。前の案があればそちらを選び直す
        if (index >= 0 && mountedRef.current) {
          countRef.current -= 1;
          setCandidates((prev) => prev.filter((_, i) => i !== index));
          setSelectedIndex(Math.max(index - 1, 0));
        }
        safeSetPhase({ kind: 'error', error: toLlmError(e) });
      } finally {
        busyRef.current = false;
      }
    },
    [safeSetPhase, updateCandidate],
  );

  /** 重みが無ければ確認を挟んでから run する */
  const runWithConfirm = useCallback(
    async (targetModelId: LlmModelId) => {
      if (busyRef.current) return;
      if (
        !isModelLoaded(targetModelId) &&
        !(await isModelCached(targetModelId))
      ) {
        safeSetPhase({ kind: 'confirm-download' });
        return;
      }
      await run(targetModelId);
    },
    [run, safeSetPhase],
  );

  /** 入力が揃ったところで呼ぶ。前の案は捨てて最初から */
  const start = useCallback(
    (task: LlmTask<T>) => {
      taskRef.current = task;
      countRef.current = 0;
      setCandidates([]);
      setSelectedIndex(0);
      // キャッシュの確認を待つ間に入力画面へ戻って見えないよう、先に読み込み扱いにする
      setPhase({ kind: 'loading', progress: 0, text: '' });
      void runWithConfirm(modelId);
    },
    [modelId, runWithConfirm],
  );

  const confirmDownload = useCallback(() => {
    void run(modelId);
  }, [modelId, run]);

  /** ダウンロードをやめたら、案が無ければ入力に戻す */
  const cancelDownload = useCallback(() => {
    if (countRef.current === 0) {
      taskRef.current = null;
      setPhase({ kind: 'idle' });
    } else {
      setPhase({ kind: 'ready' });
    }
  }, []);

  const regenerate = useCallback(() => {
    void runWithConfirm(modelId);
  }, [modelId, runWithConfirm]);

  /** モデルを替えたら、同じ入力でその場で1案つくる（違いを並べて見せる） */
  const changeModel = useCallback(
    (next: LlmModelId) => {
      if (busyRef.current) return;
      setModelId(next);
      if (taskRef.current) void runWithConfirm(next);
    },
    [runWithConfirm, setModelId],
  );

  const stop = useCallback(() => {
    interrupt();
  }, []);

  /** 入力に戻る。生成中なら止める */
  const reset = useCallback(() => {
    if (busyRef.current) interrupt();
    taskRef.current = null;
    countRef.current = 0;
    setCandidates([]);
    setSelectedIndex(0);
    setPhase({ kind: 'idle' });
  }, []);

  const isActive = phase.kind !== 'idle';
  const isBusy =
    phase.kind === 'loading' ||
    phase.kind === 'generating' ||
    phase.kind === 'finalizing';

  return {
    modelId,
    phase,
    candidates,
    selectedIndex,
    selected: candidates[selectedIndex] as Candidate<T> | undefined,
    select: setSelectedIndex,
    isActive,
    isBusy,
    start,
    confirmDownload,
    cancelDownload,
    regenerate,
    changeModel,
    stop,
    reset,
  };
}

export type LocalLlm<T> = ReturnType<typeof useLocalLlm<T>>;
