/**
 * 出典: shukatsu-box/frontend/app/src/features/EntrySheet/constants/index.ts
 */

export const ENTRY_SHEETS_QUESTION_MAX_LENGTH = 50;
export const ENTRY_SHEETS_COMPANY_NAME_MAX_LENGTH = 50;
export const ENTRY_SHEETS_EPISODE_MAX_LENGTH = 1000;
export const ENTRY_SHEETS_ORIGINAL_CONTENT_MAX_LENGTH = 1000;

/** 質問の選択肢（選んでも自由入力でも可）。文言は Figma node 3302:4093 準拠 */
export const ENTRY_SHEETS_QUESTION_OPTIONS = [
  '自己PRをしてください',
  '学生時代に力を入れたこと',
  '当社を志望する理由を教えてください',
] as const;

/**
 * 入力欄のラベルとプレースホルダ。
 * 出典: Figma「新しいESを作成」(node 3302:3937) /「ESを添削」(node 3302:3968)
 */
export const ENTRY_SHEETS_TEXT = {
  question: {
    label: 'ESの質問',
    placeholder: 'あなたの強み・弱みを教えてください',
  },
  companyName: {
    label: '提出する企業名',
    placeholder: '指定しない',
  },
  characterLimit: {
    label: '文字数を指定',
    placeholder: '指定しない',
    /** 入力欄の右に置く単位 */
    suffix: '文字以内',
  },
  episode: {
    label: '文章や必ず入れたいエピソード',
    placeholder:
      '短いキーワードを入力するだけで、AIが文章をきれいに仕上げます。',
  },
  originalContent: {
    label: '本文',
    placeholder:
      '作成済みのESを入力して下さい。AIがあなたの文章を自然で伝わりやすい形に整えます。',
  },
} as const;

/** 文字数指定の選択肢 */
export const ENTRY_SHEETS_CHARACTER_LIMIT_OPTIONS = [
  '300',
  '400',
  '500',
] as const;

/** 画像アップロードの上限（本番と同じ 10MB） */
export const ENTRY_SHEETS_MAX_IMAGE_SIZE = 10 * 1024 * 1024;

export const ENTRY_SHEETS_IMAGE_ERRORS = {
  notImage: '画像ファイルを選択してください。',
  tooLarge: '画像サイズは10MBまでです。',
  extractFailed: 'テキストを読み取れませんでした。別の画像をお試しください。',
} as const;

/** 企業名の候補（本番は API から取得。モックでは固定リスト） */
export const ENTRY_SHEETS_COMPANY_NAME_SUGGESTIONS = [
  '株式会社サンプル',
  'サンプル商事株式会社',
  '株式会社サンプルソリューションズ',
  'サンプル銀行',
  '株式会社サンプルメディア',
] as const;

// 生成AIの注意書きは ~/components/ConsentNotice が3ツール共通で持つ
// （Figma 自己PRツール node 3578:22404 の文言）
