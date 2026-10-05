import { RotateCcw, Square } from 'lucide-react';
import { Button } from '~/components/Button';
import { Dialog } from '~/components/Dialog';
import { ErrorNotice } from '~/components/ErrorNotice';
import { Tabs } from '~/components/Tabs';
import { LoadProgress } from '~/features/LocalLlm/components/LoadProgress';
import { ModelSelect } from '~/features/LocalLlm/components/ModelSelect';
import {
  findModel,
  formatMB,
  LLM_MODELS,
  type LlmModelId,
} from '~/features/LocalLlm/constants';
import type {
  Candidate,
  LocalLlm,
} from '~/features/LocalLlm/hooks/useLocalLlm';

export type Preview = { title?: string; body: string };

type Props<T> = {
  llm: LocalLlm<T>;
  /** 生成途中の素のテキストを、画面に出す形にする（タイトルと本文を分けるなど） */
  toPreview: (text: string) => Preview;
  /** 「この案で保存する」 */
  onSave: (result: T) => void;
  isSaving: boolean;
  /** 保存（データ層）の失敗。生成の失敗とは別に出す */
  saveError?: string;
  /** 入力に戻る */
  onBack: () => void;
};

/**
 * ブラウザ内LLMでの生成画面。AIを組み込んだ UI で設計しておく5つの状態を1か所で描く。
 *
 *   1. 読み込み … 初回は確認を挟んでダウンロード。進み具合を%で見せる
 *   2. 生成中   … 1トークンずつ届く本文をそのまま流す。途中で止められる
 *   3. 揺れ     … 同じ入力でも結果が変わる。再生成した案をタブで比べる
 *   4. 失敗     … メモリ不足などは起きる前提で、軽いモデル・入力へ戻る道を出す
 *   5. 確定     … 保存したら結果画面（編集できる）へ。最後に決めるのは人
 *
 * ツール名・ツール色は持たない（bg-primary は居るツールの色になる）。
 */
export function LlmGenerationPanel<T>({
  llm,
  toPreview,
  onSave,
  isSaving,
  saveError,
  onBack,
}: Props<T>) {
  const { phase, candidates, selected, selectedIndex, modelId } = llm;
  const model = findModel(modelId);
  const isGenerating = phase.kind === 'generating';

  return (
    <div className='flex flex-col gap-lg'>
      <div className='flex flex-col gap-xs'>
        <h2 className='text-lg font-bold leading-md'>
          {heading(phase.kind, selected?.stopped ?? false)}
        </h2>
        <div className='flex flex-wrap items-center gap-xs'>
          <ModelSelect
            value={modelId}
            onChange={llm.changeModel}
            disabled={llm.isBusy || isSaving}
          />
          <span className='text-xxs text-font-gray'>
            この端末のブラウザの中で生成しています
          </span>
        </div>
      </div>

      {phase.kind === 'loading' && (
        <LoadProgress
          modelId={modelId}
          progress={phase.progress}
          detail={phase.text}
        />
      )}

      {candidates.length > 1 && (
        <Tabs
          options={candidates.map((_, i) => ({
            label: `案${i + 1}`,
            value: String(i),
          }))}
          value={String(selectedIndex)}
          onChange={(v) => {
            if (!llm.isBusy) llm.select(Number(v));
          }}
        />
      )}

      {selected && (
        <CandidateCard
          candidate={selected}
          preview={toPreview(selected.text)}
          isStreaming={isGenerating && selectedIndex === candidates.length - 1}
        />
      )}

      {phase.kind === 'finalizing' && (
        <p className='flex items-center gap-xs text-xs text-font-gray'>
          <span
            aria-hidden
            className='size-4 animate-spin rounded-infinity border-2 border-primary border-t-transparent'
          />
          仕上げています…
        </p>
      )}

      {phase.kind === 'error' && (
        <ErrorNotice message={phase.error.userMessage} />
      )}
      {saveError && <ErrorNotice message={saveError} />}

      <Actions
        llm={llm}
        onSave={onSave}
        isSaving={isSaving}
        onBack={onBack}
        lighterModelId={lighterThan(modelId)}
      />

      <Dialog
        isOpen={phase.kind === 'confirm-download'}
        title='モデルをダウンロードします'
        description={`${model.label}（${formatMB(model.downloadMB)}）を端末に保存します。初回だけで、2回目からはダウンロードしません。通信量にご注意ください。`}
        confirmText='ダウンロード'
        cancelText='やめる'
        onConfirm={llm.confirmDownload}
        onCancel={llm.cancelDownload}
      />
    </div>
  );
}

function heading(
  kind: LocalLlm<unknown>['phase']['kind'],
  stopped: boolean,
): string {
  switch (kind) {
    case 'loading':
    case 'confirm-download':
      return '準備しています';
    case 'generating':
    case 'finalizing':
      return '作成しています';
    case 'error':
      return '作成できませんでした';
    default:
      return stopped ? '途中で止めました' : '作成しました';
  }
}

/** メモリ不足のとき、1段軽いモデルを勧める（重みのサイズで比べる） */
function lighterThan(id: LlmModelId): LlmModelId | null {
  const current = findModel(id);
  const lighter = LLM_MODELS.filter(
    (m) => m.downloadMB < current.downloadMB,
  ).sort((a, b) => b.downloadMB - a.downloadMB)[0];
  return lighter?.id ?? null;
}

function CandidateCard<T>({
  candidate,
  preview,
  isStreaming,
}: {
  candidate: Candidate<T>;
  preview: Preview;
  isStreaming: boolean;
}) {
  return (
    <article
      aria-live='polite'
      aria-busy={isStreaming}
      className='flex flex-col gap-sm rounded-md border border-border-2 bg-white p-md'
    >
      <div className='flex items-center justify-between gap-xs'>
        <span className='text-xxs text-font-gray'>
          {findModel(candidate.modelId).label} で生成
        </span>
        {candidate.stopped && (
          <span className='rounded-sm bg-gray-2 px-xxs text-xxs font-bold text-font-gray'>
            途中で停止しました
          </span>
        )}
      </div>

      {preview.title && (
        <h3 className='text-md font-bold leading-md text-black'>
          {preview.title}
        </h3>
      )}
      <p className='whitespace-pre-wrap text-sm leading-lg text-black'>
        {preview.body}
        {isStreaming && (
          <span
            aria-hidden
            className='ml-3xs inline-block h-[1em] w-[2px] animate-pulse bg-primary align-text-bottom'
          />
        )}
      </p>
    </article>
  );
}

function Actions<T>({
  llm,
  onSave,
  isSaving,
  onBack,
  lighterModelId,
}: {
  llm: LocalLlm<T>;
  onSave: (result: T) => void;
  isSaving: boolean;
  onBack: () => void;
  lighterModelId: LlmModelId | null;
}) {
  const { phase, selected } = llm;

  if (phase.kind === 'generating') {
    return (
      <Button
        text='停止する'
        variant='secondary'
        beforeIcon={<Square size={16} className='mr-xxs' aria-hidden />}
        onClick={llm.stop}
      />
    );
  }

  if (llm.isBusy || phase.kind === 'confirm-download') return null;

  const result = selected?.result ?? null;

  return (
    <div className='flex flex-col gap-sm'>
      {result !== null && (
        <Button
          text='この案で保存する'
          onClick={() => onSave(result)}
          isPending={isSaving}
        />
      )}
      {phase.kind === 'error' &&
        phase.error.kind === 'memory' &&
        lighterModelId && (
          <Button
            text={`${findModel(lighterModelId).label} に切り替えて作成`}
            onClick={() => llm.changeModel(lighterModelId)}
          />
        )}
      <Button
        text={phase.kind === 'error' ? '再試行する' : 'もう一度生成する'}
        variant={result === null ? 'primary' : 'outline'}
        beforeIcon={<RotateCcw size={16} className='mr-xxs' aria-hidden />}
        onClick={llm.regenerate}
        disabled={isSaving}
      />
      <Button
        text='入力に戻る'
        variant='text'
        onClick={onBack}
        disabled={isSaving}
      />
    </div>
  );
}
