import { describe, expect, it } from 'vitest';
import { formatDateTime } from './formatDateTime';

/**
 * 出力は端末のタイムゾーンに依存するので、日付そのものは形だけを検証する。
 * 「今日」判定は now と対象を同じ日の正午前後に置き、どの TZ でも
 * 同じ暦日に収まるようにしている。
 */
describe('formatDateTime', () => {
  it('当日なら日付が「今日」になる', () => {
    const now = new Date('2026-09-29T12:00:00.000Z');

    expect(formatDateTime('2026-09-29T12:30:00.000Z', now)).toMatch(
      /^今日 \d{2}:\d{2}$/,
    );
  });

  it('当日でなければ日付を出す', () => {
    const now = new Date('2026-09-29T12:00:00.000Z');

    expect(formatDateTime('2026-09-20T12:00:00.000Z', now)).toMatch(
      /^\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}$/,
    );
  });

  it('年が違えば同じ月日でも「今日」にしない', () => {
    const now = new Date('2026-09-29T12:00:00.000Z');

    expect(formatDateTime('2025-09-29T12:00:00.000Z', now)).not.toMatch(/今日/);
  });

  it('パースできない値は空文字', () => {
    expect(formatDateTime('')).toBe('');
    expect(formatDateTime('not-a-date')).toBe('');
  });
});
