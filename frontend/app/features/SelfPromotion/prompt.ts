import { LlmError } from '~/features/LocalLlm/errors';
import type { LlmTask } from '~/features/LocalLlm/hooks/useLocalLlm';
import { clampTitle, splitTitle } from '~/features/LocalLlm/text';
import type { CreateSelfPromotionRequest } from '~/types/selfPromotion';

type Generated = NonNullable<CreateSelfPromotionRequest['generated']>;

/**
 * 自己PRのプロンプト。段落構成は就活BOX の本番プロンプトの指定
 * （api-schema/src/generators/self-promotion.ts の冒頭コメント）と同じ。
 *
 * 小さいモデルは長い指示を落としやすいので、書式は短く具体的に書く。
 * 記入済みの出力例を足すのは逆効果だった（LFM2.5 1.2B で例の文を丸写しし、
 * 同じ文を延々と繰り返した）。
 */
export function buildSelfPromotionTask(
  req: CreateSelfPromotionRequest,
): LlmTask<Generated> {
  return {
    messages: [
      {
        role: 'system',
        content:
          'あなたは就職活動の自己PRを書くアシスタントです。日本語の「です・ます」調で、学生本人の一人称（私）で書きます。',
      },
      {
        role: 'user',
        content: `次の情報から自己PRを書いてください。

- 長所: ${req.strength}
- 長所を発揮した場面: ${req.situation}
- 大変だったこと: ${req.difficulty}
- どう解決したか: ${req.solution}

書式:
1行目にタイトルだけを書く。タイトルは40字以内の体言止めにし、文にしない（形の例:「傾聴力でサークルの対立をまとめた経験」。内容は入力に合わせる）。
空行を1つ入れてから本文を4段落で書く。見出し・箇条書き・記号は使わない。

本文の流れ（各段落に見出しは付けず、文章だけを書く）:
1段落目は「私の強みは${req.strength}です。」の一文だけ。
2段落目では、長所を活かした出来事を100字以内で述べる。
3段落目では、大変だったこと、どう解決したか、そこから学んだことを200字以内で述べる。
4段落目では、入社後に貢献できることを100字以内で謙虚に短く述べる。

入力にない職種・固有名詞・数値は作らない。入力の場面（${req.situation}）の話として書く。`,
      },
    ],
    finalize: (text) => parseSelfPromotion(text),
  };
}

export function parseSelfPromotion(text: string): Generated {
  const { title, body } = splitTitle(text);
  if (!title || !body) throw new LlmError('parse', text);
  return { title: clampTitle(title), content: body };
}
