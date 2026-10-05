/**
 * モデルの出力（素のテキスト）を画面と保存の形に整える純粋関数。
 * 小さいモデルは指示どおりの書式を守りきれないので、よくある崩れを吸収する。
 */

/** 思考モードを止めても、空の <think></think> が残ることがある */
export function stripThinking(text: string): string {
  return text.replace(/<think>[\s\S]*?(<\/think>|$)/g, '').replace(/^\s+/, '');
}

/** 段落の区切りを空行1つに揃え、行頭の記号（Markdown の見出しや箇条書き）を落とす */
export function normalizeParagraphs(text: string): string {
  return text
    .split(/\n\s*\n/)
    .map((p) =>
      p
        .split('\n')
        .map((line) =>
          line
            .replace(/^\s*(#+|[-*・]|\d+[.．)])\s*/, '')
            // 指示の「1段落目」をそのまま書き写してしまうことがある
            .replace(/^\s*\d+\s*段落目\s*[:：]?\s*/, '')
            .trim(),
        )
        .filter(Boolean)
        .join(''),
    )
    .filter(Boolean)
    .join('\n\n');
}

const HEADING_MAX_LENGTH = 25;

/**
 * 「見出しは付けない」と指示しても、段落の頭に短い見出しを挟んでくることがある。
 * 句点で終わらない短い段落は見出しとみなして落とす。
 */
export function dropHeadingParagraphs(text: string): string {
  return text
    .split('\n\n')
    .filter(
      (p) => p.length > HEADING_MAX_LENGTH || /[。．.!！?？」』）)]$/.test(p),
    )
    .join('\n\n');
}

const TITLE_MAX_LENGTH = 40;

function cleanTitle(line: string): string {
  return line
    .replace(/^\s*#+\s*/, '')
    .replace(/^\s*(タイトル|題名|title)\s*[:：]\s*/i, '')
    .replace(/^[「『【"*\s]+|[」』】"*\s]+$/g, '')
    .trim();
}

/**
 * 「1行目がタイトル、空行のあとに本文」の出力を分ける。
 * ストリーミングの途中でも呼ぶので、本文がまだ無くても壊れない。
 */
export function splitTitle(raw: string): { title: string; body: string } {
  const text = stripThinking(raw);
  const newline = text.indexOf('\n');
  if (newline === -1) return { title: cleanTitle(text), body: '' };

  const title = cleanTitle(text.slice(0, newline));
  const body = dropHeadingParagraphs(
    normalizeParagraphs(text.slice(newline + 1)),
  );
  return { title, body };
}

/** 本番のタイトル上限（40字）に収める。既存の生成器と同じ切り方 */
export function clampTitle(title: string): string {
  return title.length > TITLE_MAX_LENGTH
    ? `${title.slice(0, TITLE_MAX_LENGTH - 1)}…`
    : title;
}

/** タイトルを持たない出力（ES の本文）のプレビュー */
export function toBodyPreview(raw: string): { body: string } {
  return {
    body: dropHeadingParagraphs(normalizeParagraphs(stripThinking(raw))),
  };
}
