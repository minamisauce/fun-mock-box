import type {
  AiExplanationCreateV1,
  AiExplanationReviewV1,
  CreateEntrySheetRequest,
  ExtractedEntrySheet,
  ReviewEntrySheetRequest,
} from "~/types/entrySheet";

/**
 * 擬似「AI生成」。入力値を差し込んだテンプレートを組み立てる。
 * 入力文字列のハッシュで文型を決定論的に選ぶ（同じ入力 → 同じ結果）。
 */

function hash(source: string): number {
  let value = 0;
  for (let i = 0; i < source.length; i++) {
    value = (value * 31 + source.charCodeAt(i)) >>> 0;
  }
  return value;
}

function pick<T>(patterns: readonly T[], seed: number, offset: number): T {
  return patterns[(seed + offset) % patterns.length];
}

// ---------------------------------------------------------------- 作成(CREATE)

const CREATE_OPENING: ReadonlyArray<(r: CreateEntrySheetRequest) => string> = [
  (r) => `私が${r.question.replace(/[？?]$/, "")}という問いに対してお伝えしたいのは、${r.episode}という経験です。`,
  (r) => `${r.episode}——これが、私を最もよく表す経験です。`,
  (r) => `私は${r.episode}に真剣に取り組んできました。`,
];

const CREATE_BODY: ReadonlyArray<(r: CreateEntrySheetRequest) => string> = [
  () =>
    `取り組みを始めた当初は思うような成果が出ず、原因を一つずつ整理することから始めました。周囲に協力を仰ぎながら改善を重ねた結果、当初の課題は着実に解消へ向かいました。`,
  () =>
    `当初は何から手をつけるべきか分からず苦労しましたが、現状を数字で把握し、優先順位をつけて動くようにしました。地道な積み重ねでしたが、周囲からも協力を得られるようになりました。`,
  () =>
    `うまくいかない時期が続きましたが、原因を人のせいにせず、自分にできることを探し続けました。小さな改善を重ねるうちに、周囲の反応も少しずつ変わっていきました。`,
];

const CREATE_CLOSING: ReadonlyArray<(r: CreateEntrySheetRequest) => string> = [
  (r) =>
    `この経験で培った姿勢を、${r.company_name}でも活かしてまいります。目の前の課題に誠実に向き合い、着実に成果を積み上げられる人材として貢献したいと考えております。`,
  (r) =>
    `${r.company_name}においても、この粘り強さを発揮し、チームの一員として信頼を積み重ねていきたいと考えております。`,
  (r) =>
    `${r.company_name}でもこの経験を活かし、課題から逃げずに向き合う姿勢で力になれるよう努めてまいります。`,
];

const CREATE_EXPLANATIONS: AiExplanationCreateV1 = [
  {
    title: "強みの明確化",
    content:
      "冒頭で伝えたい経験を明確に示しているため、読み手が最初の一文で内容を把握できます。採用担当者は多くのESに目を通すため、結論から書く構成が効果的です。",
  },
  {
    title: "課題と行動の具体化",
    content:
      "「何が問題だったか」「そのために何をしたか」を分けて書いているため、行動の再現性が伝わります。結果だけでなく過程を書くことで、入社後の働き方が想像しやすくなります。",
  },
  {
    title: "企業への接続",
    content:
      "最後の段落で経験と志望先を結びつけています。経験の紹介で終わらせず、入社後にどう活かすかまで書くことで志望度が伝わります。",
  },
];

export type GeneratedEntrySheetCreate = {
  content: string;
  ai_explanation_json: AiExplanationCreateV1;
};

export function generateEntrySheetCreate(
  req: CreateEntrySheetRequest,
): GeneratedEntrySheetCreate {
  const seed = hash(`${req.question}|${req.company_name}|${req.episode}`);

  const paragraphs = [
    pick(CREATE_OPENING, seed, 0)(req),
    pick(CREATE_BODY, seed, 1)(req),
    pick(CREATE_CLOSING, seed, 2)(req),
  ];

  let content = paragraphs.join("\n\n");

  // 文字数指定があれば近づける（超過分は末尾を削る）
  if (req.character_limit && content.length > req.character_limit) {
    content = `${content.slice(0, req.character_limit - 1)}。`;
  }

  return { content, ai_explanation_json: CREATE_EXPLANATIONS };
}

// ------------------------------------------------------ 画像からのテキスト抽出

/**
 * OCR で読み取れた「ことにする」内容のサンプル。
 *
 * ES の画像には設問や企業名も一緒に写っていることが多いため、本文だけでなく
 * それらも返す。実際の読み取りでは一部しか取れないこともあるので、
 * サンプルにも「本文だけ」「設問が取れなかった」ケースを混ぜている。
 */
const EXTRACTED_SAMPLES: readonly ExtractedEntrySheet[] = [
  {
    company_name: "株式会社サンプル",
    question: "学生時代に力を入れたこと",
    content: `私が学生時代に力を入れたのは、カフェでのアルバイトです。
入社当初は接客に不慣れで、お客様を待たせてしまうことが多くありました。
そこで、混雑する時間帯の動線を見直し、ドリンクの準備手順をメモにまとめて共有しました。
その結果、提供時間が平均で2分ほど短縮され、店長からも改善を評価していただきました。`,
  },
  {
    // 本文だけが写っていたケース（設問・企業名は読み取れない）
    content: `私の強みは、課題を整理して周囲を巻き込める点です。
所属していたテニスサークルでは、参加率の低下が課題になっていました。
原因を聞き取ったところ、練習時間が一部のメンバーに合っていないことが分かりました。
日程を複数用意し、出欠を事前共有する仕組みに変えたところ、参加率は6割から9割まで回復しました。`,
  },
  {
    // 企業名は読めたが設問が切れていたケース
    company_name: "サンプル商事株式会社",
    content: `大学では地域のボランティア活動に3年間参加してきました。
当初は参加者が集まらず、活動の継続が危ぶまれる状況でした。
そこでSNSでの発信を担当し、活動の様子を写真つきで週1回投稿するようにしました。
半年で新規参加者が20名増え、現在は後輩が運営を引き継いでいます。`,
  },
];

export function extractSample(fileName: string): ExtractedEntrySheet {
  return EXTRACTED_SAMPLES[hash(fileName) % EXTRACTED_SAMPLES.length];
}

// ---------------------------------------------------------------- 添削(REVIEW)

/**
 * 添削は「元の文章を少し整えたもの」を返す。
 * 実際の推敲はしないが、読点の整理と結びの追加でそれらしく見せる。
 */
export type GeneratedEntrySheetReview = {
  content: string;
  ai_explanation_json: AiExplanationReviewV1;
};

export function generateEntrySheetReview(
  req: ReviewEntrySheetRequest,
): GeneratedEntrySheetReview {
  const original = req.original_content.trim();
  const seed = hash(`${req.question}|${req.company_name}|${original}`);

  const head = original.length > 60 ? original.slice(0, 60) : original;

  const content = [
    `${head.replace(/。$/, "")}。この経験を通じて、課題を構造的に捉えて行動に移す姿勢が身につきました。`,
    `取り組みの結果は具体的な数値としても表れ、周囲からも評価をいただきました。`,
    `${req.company_name}においても、この姿勢を活かして着実に成果を積み上げてまいります。`,
  ].join("\n\n");

  // 本番のプロンプトは before/after/comment を最大3件返す
  const explanations: AiExplanationReviewV1 = [
    {
      title: "成果の数値化",
      before: "売上が上がりました。",
      after: "売上が前年比120%に増加し、店長から表彰されました。",
      comment:
        "「上がりました」という曖昧な表現を数値に置き換えることで、成果の大きさが客観的に伝わります。数字は採用担当者が最も注目する要素のひとつです。",
    },
    {
      title: "結論の先出し",
      before: "大学時代、私は様々な活動に参加してきました。その中で……",
      after: "私の強みは、課題を構造的に捉えて行動に移せることです。",
      comment:
        "前置きが長いと読み手の関心が離れます。最初の一文で結論を示すと、以降の内容が頭に入りやすくなります。",
    },
    {
      title: "企業への接続",
      before: "この経験を今後に活かしたいです。",
      after: `${req.company_name}においても、この姿勢を活かして着実に成果を積み上げてまいります。`,
      comment:
        "「今後」では漠然としています。志望先の社名を入れて具体的に書くことで、その企業に向けて書かれた文章であることが伝わります。",
    },
  ];

  // 本番は最大3件。ここでは3件固定で返す
  return { content, ai_explanation_json: explanations };
}
