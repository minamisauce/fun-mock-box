/**
 * 業界・業種・志望理由・経験の候補。
 * 出典: shukatsu-box/frontend/app/src/features/Motivation/constants/inputText.ts
 */

/** 一度に表示する候補の数 */
export const SuggestExperienceMaxCount = 6;

export const industry = [
  'メーカー',
  '商社',
  '流通・小売',
  '金融',
  'サービス・インフラ',
  '広告・出版・マスコミ',
  'IT・情報通信',
  '不動産・建設',
  '官公庁・公社・団体',
] as const;

export type Industry = (typeof industry)[number];

const sectorManufacturer = [
  '素材',
  '化学',
  '食品',
  '医薬品',
  '自動車',
  '電機・精密機器',
] as const;

const sectorTrading = ['総合商社', '専門商社'] as const;

const sectorRetail = [
  '百貨店',
  'スーパー',
  'コンビニ',
  'アパレル',
  '専門店',
] as const;

const sectorFinance = ['銀行', '証券', '保険', 'リース', 'クレジット'] as const;

const sectorServiceInfra = [
  '外食',
  'ホテル',
  'アミューズメント',
  '人材',
  'コンサル',
  '運輸',
  '電力・ガス',
  '通信',
] as const;

const sectorMediaPublishing = [
  '広告代理店',
  '出版',
  '放送',
  '映像・芸能プロダクション',
] as const;

const sectorITCommunication = ['ソフトウェア', '情報処理', '通信事業'] as const;

const sectorRealEstateConstruction = [
  '不動産業',
  'ゼネコン',
  'ハウスメーカー',
] as const;

const sectorGovernmentOrganization = [
  '国家公務員',
  '地方公務員',
  '独立行政法人',
  '公益法人',
] as const;

/** 業界名 → その業界の業種一覧 */
export const SECTORS_BY_INDUSTRY: Record<Industry, readonly string[]> = {
  メーカー: sectorManufacturer,
  商社: sectorTrading,
  '流通・小売': sectorRetail,
  金融: sectorFinance,
  'サービス・インフラ': sectorServiceInfra,
  '広告・出版・マスコミ': sectorMediaPublishing,
  'IT・情報通信': sectorITCommunication,
  '不動産・建設': sectorRealEstateConstruction,
  '官公庁・公社・団体': sectorGovernmentOrganization,
};

export const reason = [
  '企業の理念やビジョンへの共感',
  '業務内容',
  '成長環境',
  'キャリアパス',
  '社風や働く人の魅力',
  '商品やサービスの魅力・共感',
] as const;

export const experience = [
  'テニスサークル',
  'サッカー部',
  'アルバイト',
  'ボランティア活動',
  '学生団体でのリーダーシップ',
  'インターンシップ',
  '研究プロジェクト',
  '留学経験',
  'アルバイトリーダーとしての経験',
  '学部内のイベント企画',
  '学外のワークショップ参加',
  'スポーツチームのキャプテン',
  'アカデミックカンファレンスでの発表',
  'クラス代表',
  '音楽バンドの活動',
  '芸術展の企画運営',
  'ディベートクラブ',
  '学園祭の運営',
  '地域コミュニティの活動',
  '外国語学習グループ',
  'メンバー数を増やした実績',
  '売り上げを前年比で大幅に上げたこと',
  'リーグ優勝に導いた経験',
  '地域社会に貢献した事例',
  'プロジェクトで成功を収めた事例',
  '新しい提案を採用された経験',
  '特筆すべき成果を出したこと',
  '異文化交流を深めた',
  'チームの業績を向上させた',
  '企画・運営で高い評価を得たこと',
  '積極的な学びと貢献',
  '危機管理',
  'アカデミックカンファレンスでの優れた発表',
  '学生の意見を代弁し、改善を実現',
  'コンサート成功',
  '企画運営で大勢の来場者を集めた',
  '論争力の高さ',
  '新しい企画を成功させた',
  '地域コミュニティ活動でのリーダーシップ',
  '言語習得と交流の促進',
  'SNSの有効活用',
  '部員同士の話し合い',
  'SNSで情報発信',
  'イベント成功への貢献',
  '新規プロジェクト成功',
  '提案の実現と成功',
  '成果を上げた研究',
  '異文化交流の促進',
  'チーム業績の向上',
  'イベント企画実行',
  'ワークショップ参加',
  '危機管理の実施',
  'カンファレンス発表',
  '改善提案の実現',
  '成功したコンサート',
  '芸術展の大成功',
  'ディベートで優勝',
  '学園祭の新企画',
  'コミュニティ主導',
  '言語交流の促進',
] as const;
