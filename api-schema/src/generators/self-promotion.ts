import type { CreateSelfPromotionRequest } from '../api/self-promotion/self-promotion';

/**
 * 擬似「AI生成」。入力値を差し込んだテンプレート文を組み立てる。
 *
 * 文型は複数用意し、入力文字列から求めた簡易ハッシュで決定論的に選ぶ。
 * - 同じ入力 → 毎回同じ結果（デモの再現性が保てる）
 * - 違う入力 → 文面が変わる（テンプレ臭さが薄れる）
 *
 * 段落構成は shukatsu-box の本番プロンプトの指定に合わせている:
 *   1. 強み・長所を一行で
 *   2. 長所を活かした出来事（100字以内）
 *   3. 大変だったこと・解決策・学び（200字以内）
 *   4. 入社後に貢献できること（100字以内、謙虚に短く）
 */

type Req = CreateSelfPromotionRequest;

function hash(req: Req): number {
  const source = `${req.strength}|${req.situation}|${req.difficulty}|${req.solution}`;
  let value = 0;
  for (let i = 0; i < source.length; i++) {
    value = (value * 31 + source.charCodeAt(i)) >>> 0;
  }
  return value;
}

function pick<T>(patterns: readonly T[], seed: number, offset: number): T {
  return patterns[(seed + offset) % patterns.length];
}

const TITLE_PATTERNS: ReadonlyArray<(r: Req) => string> = [
  (r) => `${r.strength}を活かして${r.situation}を前に進めた経験`,
  (r) => `${r.situation}で発揮した${r.strength}`,
  (r) => `${r.strength}で困難を乗り越えた${r.situation}での挑戦`,
];

const OPENING_PATTERNS: ReadonlyArray<(r: Req) => string> = [
  (r) => `私の強みは${r.strength}です。`,
  (r) => `私は${r.strength}を最大の強みとしています。`,
  (r) => `どのような環境でも発揮できる私の強みは、${r.strength}です。`,
];

const EPISODE_PATTERNS: ReadonlyArray<(r: Req) => string> = [
  (r) =>
    `この強みが最もよく表れたのは、${r.situation}に取り組んでいたときのことです。周囲と目標を共有しながら、自分にできることを探し続けました。`,
  (r) =>
    `${r.situation}において、私はこの強みを活かして行動しました。決して目立つ役割ではありませんでしたが、自分にできる関わり方を模索し続けました。`,
  (r) =>
    `${r.situation}での経験が、この強みを自覚するきっかけになりました。手探りながらも、前に進めるための一手を考え続けた日々でした。`,
];

const CHALLENGE_PATTERNS: ReadonlyArray<(r: Req) => string> = [
  (r) =>
    `当初は${r.difficulty}という壁に直面し、思うような成果を出せない時期が続きました。そこで私は${r.solution}に取り組み、少しずつ周囲を巻き込みながら改善を重ねました。すぐに結果が出たわけではありませんが、続けるうちに状況は着実に変わっていきました。この過程で、課題を正面から捉えて手を動かし続けることの大切さを学びました。`,
  (r) =>
    `特に苦労したのが${r.difficulty}でした。原因を一つずつ整理したうえで、${r.solution}という形で打ち手を実行に移しました。うまくいかない場面もありましたが、その都度やり方を見直したことで、最終的には周囲からも協力を得られるようになりました。粘り強く向き合う姿勢が成果につながることを実感しています。`,
  (r) =>
    `最大の課題は${r.difficulty}でした。自分一人では解決できないと考え、${r.solution}を軸に周囲へ働きかけました。試行錯誤の連続でしたが、小さな改善を積み重ねた結果、当初の課題は解消に向かいました。この経験から、課題の本質を見極めて行動に移すことの重要性を学びました。`,
];

const CLOSING_PATTERNS: ReadonlyArray<(r: Req) => string> = [
  (r) =>
    `この${r.strength}を活かし、貴社でも課題に真摯に向き合い、着実に成果を積み上げられる人材として貢献していきたいと考えております。`,
  (r) =>
    `${r.situation}で培った${r.strength}を、貴社の業務においても発揮し、チームの一員として少しずつ信頼を積み重ねていきたいと考えております。`,
  (r) =>
    `この経験で身につけた${r.strength}をもって、貴社でも粘り強く課題に取り組み、力になれるよう努めてまいります。`,
];

export type GeneratedSelfPromotion = {
  title: string;
  content: string;
};

export function generateSelfPromotion(req: Req): GeneratedSelfPromotion {
  const seed = hash(req);

  const title = pick(TITLE_PATTERNS, seed, 0)(req);

  const content = [
    pick(OPENING_PATTERNS, seed, 1)(req),
    pick(EPISODE_PATTERNS, seed, 2)(req),
    pick(CHALLENGE_PATTERNS, seed, 3)(req),
    pick(CLOSING_PATTERNS, seed, 4)(req),
  ].join('\n\n');

  return {
    // 本番のタイトル上限に合わせて 40 文字で切る
    title: title.length > 40 ? `${title.slice(0, 39)}…` : title,
    content,
  };
}
