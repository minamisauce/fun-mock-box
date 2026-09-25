/** URL を組み立てる場所を1箇所に集約する */
export const paths = {
  home: "/",

  selfPromotionsNew: "/self-promotions/new",
  selfPromotionsNewStep: (step: string) => `/self-promotions/new/${step}`,
  selfPromotion: (id: string) => `/self-promotions/${id}`,

  motivationsNew: "/motivations/new",
  motivationsNewStep: (step: string) => `/motivations/new/${step}`,
  motivation: (id: string) => `/motivations/${id}`,

  entrySheetsNew: "/entry-sheets/new",
  entrySheetsReviewNew: "/entry-sheets/review/new",
  entrySheet: (id: string) => `/entry-sheets/${id}`,
} as const;
