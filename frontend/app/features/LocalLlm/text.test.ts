import { describe, expect, it } from 'vitest';
import {
  clampTitle,
  dropHeadingParagraphs,
  normalizeParagraphs,
  splitTitle,
  stripThinking,
} from '~/features/LocalLlm/text';

describe('stripThinking', () => {
  it('空の思考ブロックを落とす', () => {
    expect(stripThinking('<think>\n\n</think>\n\n本文')).toBe('本文');
  });

  it('閉じていない思考ブロック（生成途中）も落とす', () => {
    expect(stripThinking('<think>考え中')).toBe('');
  });
});

describe('normalizeParagraphs', () => {
  it('段落の区切りを空行1つに揃える', () => {
    expect(normalizeParagraphs('一段落目。\n\n\n\n二段落目。')).toBe(
      '一段落目。\n\n二段落目。',
    );
  });

  it('見出し記号と箇条書きの記号を落とす', () => {
    expect(normalizeParagraphs('## 見出し\n\n- 項目\n1. 番号')).toBe(
      '見出し\n\n項目番号',
    );
  });
});

describe('splitTitle', () => {
  it('1行目をタイトル、残りを本文にする', () => {
    expect(
      splitTitle('粘り強さで乗り越えた経験\n\n私の強みは粘り強さです。'),
    ).toEqual({
      title: '粘り強さで乗り越えた経験',
      body: '私の強みは粘り強さです。',
    });
  });

  it('「タイトル：」や括弧・Markdown の見出しを外す', () => {
    expect(splitTitle('タイトル：「粘り強さ」\n\n本文').title).toBe('粘り強さ');
    expect(splitTitle('# **粘り強さ**\n\n本文').title).toBe('粘り強さ');
  });

  it('改行がまだ来ていない（ストリーミング途中）なら本文は空', () => {
    expect(splitTitle('粘り強')).toEqual({ title: '粘り強', body: '' });
  });
});

describe('dropHeadingParagraphs', () => {
  it('句点で終わらない短い段落（見出し）を落とす', () => {
    expect(
      dropHeadingParagraphs(
        '私の強みは粘り強さです。\n\n粘り強さで改善した\n\n手順を見直して共有しました。',
      ),
    ).toBe('私の強みは粘り強さです。\n\n手順を見直して共有しました。');
  });

  it('句点が無くても長い段落は残す', () => {
    const long = 'あ'.repeat(30);
    expect(dropHeadingParagraphs(long)).toBe(long);
  });
});

describe('clampTitle', () => {
  it('40字を超えたら39字で切って…を付ける', () => {
    const title = clampTitle('あ'.repeat(41));
    expect(title).toHaveLength(40);
    expect(title.endsWith('…')).toBe(true);
  });

  it('40字以内ならそのまま', () => {
    expect(clampTitle('あ'.repeat(40))).toBe('あ'.repeat(40));
  });
});
