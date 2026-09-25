/**
 * localStorage / sessionStorage の薄いラッパ。
 * SPA モード（ssr: false）なので基本ブラウザでしか動かないが、
 * プライベートモード等で例外が飛ぶケースがあるため握り潰す。
 */

export const STORAGE_KEYS = {
  selfPromotions: 'fun-mock-box:self-promotions',
  selfPromotionDraft: 'fun-mock-box:self-promotion:draft',
  motivations: 'fun-mock-box:motivations',
  motivationDraft: 'fun-mock-box:motivation:draft',
  entrySheets: 'fun-mock-box:entry-sheets',
} as const;

function safeParse<T>(raw: string | null, fallback: T): T {
  if (raw === null) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function readLocal<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    return safeParse(window.localStorage.getItem(key), fallback);
  } catch {
    return fallback;
  }
}

export function writeLocal(key: string, value: unknown): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // 容量超過・プライベートモード等。モックなので黙って諦める
  }
}

export function readSession<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    return safeParse(window.sessionStorage.getItem(key), fallback);
  } catch {
    return fallback;
  }
}

export function writeSession(key: string, value: unknown): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    // 同上
  }
}

export function removeSession(key: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.removeItem(key);
  } catch {
    // 同上
  }
}
