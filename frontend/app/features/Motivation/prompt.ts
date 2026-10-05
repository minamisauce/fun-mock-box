import { LlmError } from '~/features/LocalLlm/errors';
import type { LlmTask } from '~/features/LocalLlm/hooks/useLocalLlm';
import { clampTitle, splitTitle } from '~/features/LocalLlm/text';
import type { CreateMotivationRequest } from '~/types/motivation';

type Generated = NonNullable<CreateMotivationRequest['generated']>;

/**
 * 志望動機のプロンプト。段落構成は就活BOX の本番プロンプトの指定
 * （api-schema/src/generators/motivation.ts の冒頭コメント。全体400字程度・5段落）と同じ。
 */
export function buildMotivationTask(
  req: CreateMotivationRequest,
): LlmTask<Generated> {
  return {
    messages: [
      {
        role: 'system',
        content:
          'あなたは就職活動の志望動機を書くアシスタントです。日本語の「です・ます」調で、学生本人の一人称（私）で書きます。',
      },
      {
        role: 'user',
        content: `次の情報から志望動機を書いてください。

- 志望業界: ${req.industry}
- 志望業種: ${req.sector}
- 志望理由: ${req.reason}
- 働きたいと思ったきっかけの経験: ${req.experience}

書式:
1行目にタイトルだけを書く。タイトルは40字以内の短い句にし、文にしない（形の例:「部活で培った分析力を小売の現場で活かす」。内容は入力に合わせる）。
空行を1つ入れてから本文を5段落、全体で400字程度で書く。見出し・箇条書き・記号は使わない。

本文の流れ（各段落に見出しは付けず、文章だけを書く）:
1段落目では、志望理由を述べる。
2段落目では、この業界・業種に惹かれる点を述べる。
3段落目では、自分の強みと経験を述べる。
4段落目では、入社後にやりたいことを述べる。
5段落目では、短く締めくくる。

特定の企業名や、入力にない数値は作らない。`,
      },
    ],
    finalize: (text) => parseMotivation(text),
  };
}

export function parseMotivation(text: string): Generated {
  const { title, body } = splitTitle(text);
  if (!title || !body) throw new LlmError('parse', text);
  return { title: clampTitle(title), content: body };
}
