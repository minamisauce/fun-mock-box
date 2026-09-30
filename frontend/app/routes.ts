import {
  index,
  layout,
  prefix,
  type RouteConfig,
  route,
} from '@react-router/dev/routes';

// remix-flat-routes は使っていない。
// ファイルを置くだけでは認識されないので、必ずここに登録すること。
export default [
  // ボトムナビを持つ画面。ツール画面（ToolLayout）はこの外に置く
  layout('routes/layout.tsx', [
    index('routes/home.tsx'),
    route('history', 'routes/history.tsx'),
  ]),

  ...prefix('self-promotions', [
    layout('routes/self-promotion/layout.tsx', [
      // ⚠ この行は必須。無いと /self-promotions/new が route(":id") にマッチし、
      //    「id = "new" の結果ページ」として解決されてしまう。
      route('new', 'routes/self-promotion/new-index.tsx'),
      route('new/:step', 'routes/self-promotion/new-step.tsx'),
      route(':id', 'routes/self-promotion/result.tsx'),
    ]),
  ]),

  ...prefix('motivations', [
    layout('routes/motivation/layout.tsx', [
      route('new', 'routes/motivation/new-index.tsx'),
      route('new/:step', 'routes/motivation/new-step.tsx'),
      route(':id', 'routes/motivation/result.tsx'),
    ]),
  ]),

  // ES も作成・添削ともに1問1答のウィザード（自己PR・志望動機と同じ流れ）
  ...prefix('entry-sheets', [
    layout('routes/entry-sheet/create-layout.tsx', [
      route('new', 'routes/entry-sheet/create-index.tsx'),
      route('new/:step', 'routes/entry-sheet/create-step.tsx'),
    ]),
    layout('routes/entry-sheet/review-layout.tsx', [
      route('review/new', 'routes/entry-sheet/review-index.tsx'),
      route('review/new/:step', 'routes/entry-sheet/review-step.tsx'),
    ]),
    route(':id', 'routes/entry-sheet/result.tsx'),
  ]),
] satisfies RouteConfig;
