import { describe, expect, it } from 'vitest';
import {
  parseCreateExplanation,
  parseReviewExplanation,
} from '~/features/EntrySheet/prompts';
import { LlmError } from '~/features/LocalLlm/errors';
import { parseMotivation } from '~/features/Motivation/prompt';
import { parseSelfPromotion } from '~/features/SelfPromotion/prompt';

describe('parseSelfPromotion / parseMotivation', () => {
  it('タイトルと本文に分け、タイトルは40字に収める', () => {
    const generated = parseSelfPromotion(
      `${'長'.repeat(50)}\n\n一段落目。\n\n二段落目。`,
    );
    expect(generated.title).toHaveLength(40);
    expect(generated.content).toBe('一段落目。\n\n二段落目。');
  });

  it('本文が無ければ parse エラー', () => {
    expect(() => parseMotivation('タイトルだけ')).toThrow(LlmError);
  });
});

describe('parseCreateExplanation', () => {
  it('「見出し」「説明」の組を項目にする', () => {
    expect(
      parseCreateExplanation(
        '見出し: 結論が先\n説明: 最初に要点がある\n\n見出し：行動が具体的\n説明：何をしたかが分かる',
      ),
    ).toEqual([
      { title: '結論が先', content: '最初に要点がある' },
      { title: '行動が具体的', content: '何をしたかが分かる' },
    ]);
  });

  it('番号や Markdown の装飾、前置きの文を無視する', () => {
    expect(
      parseCreateExplanation(
        '良い点は次のとおりです。\n1. **見出し**: 結論が先\n- 説明: 要点がある',
      ),
    ).toEqual([{ title: '結論が先', content: '要点がある' }]);
  });

  it('欠けた項目は捨て、最大3件にする', () => {
    const text = ['a', '', 'c', 'd', 'e']
      .map((t, i) => `見出し: ${t}\n説明: ${i === 2 ? '' : `説明${i}`}`)
      .join('\n\n');
    expect(parseCreateExplanation(text).map((i) => i.title)).toEqual([
      'a',
      'd',
      'e',
    ]);
  });

  it('ラベルが無くても「短い見出し → 長い説明」の並びから拾う', () => {
    expect(
      parseCreateExplanation(
        '<think>\n\n</think>\n\n（10字程度）\n（1）改善力と確実な対応力\n\n（なぜ良いのか）\n混雑時の提供遅れを手順の見直しで解消した経緯が、具体的に書けています。',
      ),
    ).toEqual([
      {
        title: '改善力と確実な対応力',
        content:
          '混雑時の提供遅れを手順の見直しで解消した経緯が、具体的に書けています。',
      },
    ]);
  });

  it('使える項目が無ければ parse エラー', () => {
    expect(() => parseCreateExplanation('すみません')).toThrow(LlmError);
  });
});

describe('プロンプトの例の書き写し', () => {
  it('例と同じ文の項目は捨てる（本文に無い内容を保存しないため）', () => {
    expect(() =>
      parseReviewExplanation(
        '見出し: 成果の数値化\n修正前: 売上が上がりました。\n修正後: 売上が前年比120%に増えました。\n理由: 曖昧な表現を数値に置き換えたことで、成果の大きさが客観的に伝わります。',
      ),
    ).toThrow(LlmError);
    expect(
      parseCreateExplanation(
        '見出し: 結論が明確\n説明: 冒頭で強みを言い切っているので、読み手が最初の一文で要点をつかめます。\n\n見出し: 行動が具体的\n説明: 何をしたかが分かる',
      ),
    ).toEqual([{ title: '行動が具体的', content: '何をしたかが分かる' }]);
  });
});

describe('parseReviewExplanation', () => {
  it('修正前・修正後・理由が揃ったものだけ使う', () => {
    expect(
      parseReviewExplanation(
        '見出し: 数値化\n修正前: 「上がった」\n修正後: 「2割増えた」\n理由: 具体的\n\n見出し: 欠け\n修正前: x',
      ),
    ).toEqual([
      {
        title: '数値化',
        before: '上がった',
        after: '2割増えた',
        comment: '具体的',
      },
    ]);
  });
});
