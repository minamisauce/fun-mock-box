/**
 * 出典: shukatsu-box/frontend/app/src/features/EntrySheet/constants/index.ts
 */

export const ENTRY_SHEETS_QUESTION_MAX_LENGTH = 50;
export const ENTRY_SHEETS_COMPANY_NAME_MAX_LENGTH = 50;
export const ENTRY_SHEETS_EPISODE_MAX_LENGTH = 1000;
export const ENTRY_SHEETS_ORIGINAL_CONTENT_MAX_LENGTH = 1000;

/** 質問の選択肢（選んでも自由入力でも可） */
export const ENTRY_SHEETS_QUESTION_OPTIONS = [
  "自己PRを教えてください",
  "学生時代に力を入れたこと",
  "当社を志望する理由を教えてください",
] as const;

/** 文字数指定の選択肢 */
export const ENTRY_SHEETS_CHARACTER_LIMIT_OPTIONS = [
  "300",
  "400",
  "500",
] as const;

/** 画像アップロードの上限（本番と同じ 10MB） */
export const ENTRY_SHEETS_MAX_IMAGE_SIZE = 10 * 1024 * 1024;

export const ENTRY_SHEETS_IMAGE_ERRORS = {
  notImage: "画像ファイルを選択してください。",
  tooLarge: "画像サイズは10MBまでです。",
  extractFailed: "テキストを読み取れませんでした。別の画像をお試しください。",
} as const;

/** 企業名の候補（本番は API から取得。モックでは固定リスト） */
export const ENTRY_SHEETS_COMPANY_NAME_SUGGESTIONS = [
  "株式会社サンプル",
  "サンプル商事株式会社",
  "株式会社サンプルソリューションズ",
  "サンプル銀行",
  "株式会社サンプルメディア",
] as const;

/** 生成AI利用にあたっての注意書き（本番 TextCreateForm の文言を踏襲） */
export const ENTRY_SHEETS_NOTICES = [
  "生成された文章はそのまま提出せず、必ずご自身で内容を確認・修正してください。",
  "事実と異なる内容が含まれる場合があります。",
  "入力された内容は文章生成のためにのみ利用されます。",
] as const;
