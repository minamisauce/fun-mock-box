import { LlmError } from '~/features/LocalLlm/errors';
import type { LlmTask } from '~/features/LocalLlm/hooks/useLocalLlm';
import { stripThinking, toBodyPreview } from '~/features/LocalLlm/text';
import type {
  AiExplanationCreateV1,
  AiExplanationReviewV1,
  CreateEntrySheetRequest,
  ReviewEntrySheetRequest,
} from '~/types/entrySheet';

type GeneratedCreate = NonNullable<CreateEntrySheetRequest['generated']>;
type GeneratedReview = NonNullable<ReviewEntrySheetRequest['generated']>;

/**
 * ES のプロンプト。自己PR・志望動機と違い、本文のほかに構造化された解説
 * （ai_explanation_json）が要るので、2回に分けて生成する。
 *
 *   1回目: 本文。画面にストリーミングで流す
 *   2回目: 解説。「見出し: …」の行形式で書かせて、ここで組み立てる
 *
 * 解説を JSON モード（文法で出力を縛る）で出させないのは、Qwen3.5 が既定で
 * 思考から書き始めようとして文法とぶつかり、空白だけを出し続けるため。
 * 小さいモデルには、行の形式のほうが安定して守れる。
 */

const SYSTEM =
  'あなたは就職活動のエントリーシートを書くアシスタントです。日本語の「です・ます」調で書きます。';

/** 解説の件数。本番は最大3件 */
const EXPLANATION_MAX = 3;

const DEFAULT_CHARACTER_LIMIT = 400;

/**
 * 解説の書き方の例。小さいモデルは例をそのまま書き写すことがあり、
 * そのまま保存すると本文に無い内容（「前年比120%」など）が解説に残る。
 * パース時に、例と同じ文の項目は捨てる。
 */
const CREATE_EXAMPLE = {
  title: '結論が明確',
  content:
    '冒頭で強みを言い切っているので、読み手が最初の一文で要点をつかめます。',
};
const REVIEW_EXAMPLE = {
  title: '成果の数値化',
  before: '売上が上がりました。',
  after: '売上が前年比120%に増えました。',
  comment:
    '曖昧な表現を数値に置き換えたことで、成果の大きさが客観的に伝わります。',
};

function bodyOnly(text: string): string {
  return toBodyPreview(text).body;
}

/**
 * 「見出し: …」「説明: …」のような行の並びを、空行や見出しの出現で区切って
 * 項目ごとのレコードにする。ラベルの前の番号や記号、全角コロンも許す。
 */
export function parseLabeledBlocks(
  text: string,
  labels: Record<string, string>,
): Array<Record<string, string>> {
  const firstLabel = Object.keys(labels)[0];
  const blocks: Array<Record<string, string>> = [];
  let current: Record<string, string> = {};

  for (const raw of text.split('\n')) {
    const line = raw
      .replace(/^\s*(?:(?:#+|[-*・]|\d+[.．)]|【|\*\*)\s*)+/, '')
      .trim();
    const match = Object.entries(labels).find(([label]) =>
      new RegExp(`^${label}(\\*\\*|】)?\\s*[:：]`).test(line),
    );
    if (!match) continue;
    const [label, key] = match;
    if (label === firstLabel && Object.keys(current).length > 0) {
      blocks.push(current);
      current = {};
    }
    current[key] = line
      .replace(new RegExp(`^${label}(\\*\\*|】)?\\s*[:：]\\s*`), '')
      .replace(/^[「『"]|[」』"]$/g, '')
      .trim();
  }
  if (Object.keys(current).length > 0) blocks.push(current);
  return blocks;
}

function pickComplete<K extends string>(
  blocks: Array<Record<string, string>>,
  keys: readonly K[],
): Array<Record<K, string>> {
  return blocks
    .filter((b) => keys.every((k) => b[k]?.trim()))
    .map(
      (b) =>
        Object.fromEntries(keys.map((k) => [k, b[k]])) as Record<K, string>,
    )
    .slice(0, EXPLANATION_MAX);
}

// ---------------------------------------------------------------- 作成(CREATE)

export function buildEntrySheetCreateTask(
  req: CreateEntrySheetRequest,
): LlmTask<GeneratedCreate> {
  const limit = req.character_limit ?? DEFAULT_CHARACTER_LIMIT;

  return {
    messages: [
      { role: 'system', content: SYSTEM },
      {
        role: 'user',
        content: `次の設問に答えるエントリーシートの本文を書いてください。

- 企業名: ${req.company_name}
- 設問: ${req.question}
- 書きたいエピソード: ${req.episode}

書式:
本文だけを${limit}字以内で、3段落で書く。タイトル・見出し・箇条書き・記号は使わない。
1段落目で結論を述べ、2段落目で課題と行動、3段落目で${req.company_name}でどう活かすかを書く。
入力にない固有名詞や数値は作らない。`,
      },
    ],
    finalize: async (text, { complete }) => {
      const content = bodyOnly(text);
      if (!content) throw new LlmError('parse', text);

      const explanation = await complete([
        { role: 'system', content: SYSTEM },
        {
          role: 'user',
          content: `次のエントリーシートの良く書けている点を${EXPLANATION_MAX}つ挙げてください。
1つにつき「見出し:」の行と「説明:」の行を書き、前置きや締めの文は書かない。書き方の例:

見出し: ${CREATE_EXAMPLE.title}
説明: ${CREATE_EXAMPLE.content}

エントリーシート:
${content}`,
        },
      ]);
      return {
        content,
        ai_explanation_json: parseCreateExplanation(explanation),
      };
    },
  };
}

export function parseCreateExplanation(text: string): AiExplanationCreateV1 {
  const labeled = pickComplete(
    parseLabeledBlocks(text, { 見出し: 'title', 説明: 'content' }),
    ['title', 'content'] as const,
  );
  const items = (labeled.length > 0 ? labeled : pairShortLong(text)).filter(
    (i) => i.content !== CREATE_EXAMPLE.content,
  );
  if (items.length === 0) throw new LlmError('parse', text);
  return items;
}

const TITLE_LIKE_MAX = 25;

/**
 * ラベルを付けずに「短い見出しの行 → 長い説明の行」と並べてくることがあるので、
 * その並びからも拾う。「（1）」のような番号と、括弧だけの行（指示の書き写し）は捨てる。
 */
function pairShortLong(text: string): AiExplanationCreateV1 {
  const lines = stripThinking(text)
    .split('\n')
    .map((l) =>
      l
        .replace(/^\s*(?:(?:[（(]\d+[）)]|#+|[-*・]|\d+[.．)]|\*\*)\s*)+/, '')
        .replace(/\*\*/g, '')
        .trim(),
    )
    .filter((l) => l && !/^[（(][^）)]*[）)]$/.test(l));

  const items: AiExplanationCreateV1 = [];
  for (let i = 0; i < lines.length - 1; i++) {
    const [head, body] = [lines[i], lines[i + 1]];
    if (head.length <= TITLE_LIKE_MAX && body.length > TITLE_LIKE_MAX) {
      items.push({ title: head.replace(/[。.]$/, ''), content: body });
      i++;
    }
  }
  return items.slice(0, EXPLANATION_MAX);
}

// ---------------------------------------------------------------- 添削(REVIEW)

export function buildEntrySheetReviewTask(
  req: ReviewEntrySheetRequest,
): LlmTask<GeneratedReview> {
  return {
    messages: [
      { role: 'system', content: SYSTEM },
      {
        role: 'user',
        content: `次のエントリーシートを添削し、書き直した本文を書いてください。

- 企業名: ${req.company_name}
- 設問: ${req.question}

元の本文:
${req.original_content}

書式:
書き直した本文だけを書く。説明・タイトル・見出し・箇条書きは書かない。
元の内容と文字数を大きく変えず、結論を先に置き、曖昧な表現を具体的にする。
元の本文にない事実や数値は作らない。`,
      },
    ],
    finalize: async (text, { complete }) => {
      const content = bodyOnly(text);
      if (!content) throw new LlmError('parse', text);

      const explanation = await complete([
        { role: 'system', content: SYSTEM },
        {
          role: 'user',
          content: `エントリーシートを添削しました。主な修正点を最大${EXPLANATION_MAX}つ挙げてください。
1つにつき「見出し:」「修正前:」「修正後:」「理由:」の4行を書き、前置きや締めの文は書かない。
修正前は元の本文から、修正後は書き直した本文から、そのまま抜き出す。書き方の例:

見出し: ${REVIEW_EXAMPLE.title}
修正前: ${REVIEW_EXAMPLE.before}
修正後: ${REVIEW_EXAMPLE.after}
理由: ${REVIEW_EXAMPLE.comment}

元の本文:
${req.original_content}

書き直した本文:
${content}`,
        },
      ]);
      return {
        content,
        ai_explanation_json: parseReviewExplanation(explanation),
      };
    },
  };
}

export function parseReviewExplanation(text: string): AiExplanationReviewV1 {
  const items = pickComplete(
    parseLabeledBlocks(text, {
      見出し: 'title',
      修正前: 'before',
      修正後: 'after',
      理由: 'comment',
    }),
    ['title', 'before', 'after', 'comment'] as const,
  ).filter(
    (i) =>
      i.before !== REVIEW_EXAMPLE.before &&
      i.after !== REVIEW_EXAMPLE.after &&
      i.comment !== REVIEW_EXAMPLE.comment,
  );
  if (items.length === 0) throw new LlmError('parse', text);
  return items;
}
