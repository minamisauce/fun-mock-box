/**
 * 生成まわりの失敗を、画面に出す文言と「次に何をすればいいか」に分ける。
 *
 * WebLLM のエラーは Worker 越しに文字列として届くので、クラスでは判定できない。
 * メッセージの中身で振り分ける。
 */

export type LlmErrorKind =
  /** GPU メモリ不足・デバイスロスト。軽いモデルに替えれば通ることが多い */
  | 'memory'
  /** fp16 シェーダ非対応など、端末がモデルの要件を満たさない */
  | 'unsupported'
  /** 重みのダウンロードに失敗 */
  | 'network'
  /** 出力が期待した形にならなかった（解説の JSON が壊れていた等） */
  | 'parse'
  | 'unknown';

export class LlmError extends Error {
  readonly kind: LlmErrorKind;
  readonly userMessage: string;

  constructor(kind: LlmErrorKind, message?: string) {
    super(message ?? `LlmError: ${kind}`);
    this.name = 'LlmError';
    this.kind = kind;
    this.userMessage = USER_MESSAGES[kind];
  }
}

const USER_MESSAGES: Record<LlmErrorKind, string> = {
  memory:
    'GPU のメモリが足りず、生成が止まりました。ほかのタブを閉じるか、軽いモデルに切り替えてお試しください。',
  unsupported:
    'この端末の GPU はこのモデルに対応していません。別のモデルに切り替えてお試しください。',
  network:
    'モデルのダウンロードに失敗しました。通信環境を確認して再度お試しください。',
  parse: '生成結果をうまく読み取れませんでした。もう一度生成してください。',
  unknown: '生成中に問題が起きました。もう一度お試しください。',
};

export function toLlmError(e: unknown): LlmError {
  if (e instanceof LlmError) return e;
  const message = e instanceof Error ? `${e.name}: ${e.message}` : String(e);

  if (/device was lost|DeviceLost|out of memory|OOM|allocat/i.test(message)) {
    return new LlmError('memory', message);
  }
  if (/shader-f16|ShaderF16|FeatureSupport|WebGPU/i.test(message)) {
    return new LlmError('unsupported', message);
  }
  if (
    /fetch|network|Failed to load|NetworkError|QuotaExceeded/i.test(message)
  ) {
    return new LlmError('network', message);
  }
  return new LlmError('unknown', message);
}
