import type { CreateMotivationRequest } from '~/types/motivation';

/**
 * 擬似「AI生成」。入力値を差し込んだテンプレート文を組み立てる。
 *
 * 文型は複数用意し、入力文字列から求めた簡易ハッシュで決定論的に選ぶ。
 * 同じ入力なら毎回同じ結果、違う入力なら文面が変わる。
 *
 * 段落構成は shukatsu-box の本番プロンプトの指定（全体400字程度・5段落）に合わせている:
 *   1. 志望理由
 *   2. 企業の魅力
 *   3. 自分の強み・経験
 *   4. 入社後の展望
 *   5. 締めくくり
 */

type Req = CreateMotivationRequest;

function hash(req: Req): number {
  const source = `${req.industry}|${req.sector}|${req.reason}|${req.experience}`;
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
  (r) => `${r.sector}を志望する理由`,
  (r) => `${r.industry}・${r.sector}で実現したいこと`,
  (r) => `${r.reason}に惹かれた${r.sector}への志望動機`,
];

const REASON_PATTERNS: ReadonlyArray<(r: Req) => string> = [
  (r) =>
    `私が${r.industry}業界、なかでも${r.sector}を志望する理由は、${r.reason}に強く惹かれたからです。`,
  (r) =>
    `${r.industry}業界の${r.sector}を志望しております。きっかけは${r.reason}に触れたことでした。`,
  (r) =>
    `私は${r.sector}という仕事に携わりたいと考えています。${r.industry}業界のなかでも、${r.reason}という点に最も魅力を感じたためです。`,
];

const APPEAL_PATTERNS: ReadonlyArray<(r: Req) => string> = [
  (r) =>
    `貴社は${r.industry}業界において独自の立ち位置を築いており、${r.reason}が事業の隅々にまで行き渡っていると感じました。説明会や社員の方のお話を通じて、その印象は一層強くなりました。`,
  (r) =>
    `数ある企業のなかでも貴社を志望するのは、${r.reason}が言葉だけでなく実際の事業や制度に表れていると感じたからです。${r.sector}という領域で長く信頼を積み重ねてきた点にも惹かれています。`,
  (r) =>
    `貴社の${r.sector}における取り組みを知るなかで、${r.reason}が一貫していることに共感しました。表面的な魅力ではなく、事業の在り方そのものに現れている点が決め手です。`,
];

const EXPERIENCE_PATTERNS: ReadonlyArray<(r: Req) => string> = [
  (r) =>
    `こうした思いを持つに至ったのは、${r.experience}という経験があったからです。決して順調なことばかりではありませんでしたが、周囲と協力しながら粘り強く取り組むことで、少しずつ前に進めることを学びました。`,
  (r) =>
    `私は学生時代、${r.experience}に取り組んできました。その過程で、目の前の課題から逃げずに向き合い、周囲を巻き込みながら進めることの大切さを実感しています。`,
  (r) =>
    `${r.experience}を通じて、自分の行動が周囲に影響を与えることを知りました。この経験が、${r.sector}という仕事に関心を持つきっかけになっています。`,
];

const FUTURE_PATTERNS: ReadonlyArray<(r: Req) => string> = [
  (r) =>
    `入社後は、まず${r.sector}の業務を一つずつ確実に身につけ、早期に戦力となれるよう努めます。そのうえで、この経験で培った姿勢を活かし、チームの成果に貢献していきたいと考えています。`,
  (r) =>
    `貴社に入社した際は、${r.sector}の現場で基礎を固めることから始めたいと考えています。そのうえで、培ってきた粘り強さを活かし、より広い範囲で力になれる人材を目指します。`,
  (r) =>
    `入社後は${r.sector}の一員として、目の前の業務に真摯に取り組みながら、少しずつ任せていただける領域を広げていきたいと考えております。`,
];

const CLOSING_PATTERNS: ReadonlyArray<(r: Req) => string> = [
  () =>
    `未熟な点も多くありますが、学ぶ姿勢を怠らず、貴社の一員として着実に成長していきたいと考えております。`,
  (r) =>
    `${r.industry}業界で長く貢献できるよう、謙虚に学び続ける姿勢を大切にしてまいります。`,
  () =>
    `まだ学ぶべきことは多いと自覚しておりますが、誠実に業務と向き合い、信頼を積み重ねていきたいと考えております。`,
];

export type GeneratedMotivation = {
  title: string;
  content: string;
};

export function generateMotivation(req: Req): GeneratedMotivation {
  const seed = hash(req);

  const title = pick(TITLE_PATTERNS, seed, 0)(req);

  const content = [
    pick(REASON_PATTERNS, seed, 1)(req),
    pick(APPEAL_PATTERNS, seed, 2)(req),
    pick(EXPERIENCE_PATTERNS, seed, 3)(req),
    pick(FUTURE_PATTERNS, seed, 4)(req),
    pick(CLOSING_PATTERNS, seed, 5)(req),
  ].join('\n\n');

  return {
    // 本番のタイトル上限に合わせて 40 文字で切る
    title: title.length > 40 ? `${title.slice(0, 39)}…` : title,
    content,
  };
}
