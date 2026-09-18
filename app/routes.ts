import {
  type RouteConfig,
  index,
  layout,
  prefix,
  route,
} from "@react-router/dev/routes";

// remix-flat-routes は使っていない。
// ファイルを置くだけでは認識されないので、必ずここに登録すること。
export default [
  index("routes/home.tsx"),

  ...prefix("self-promotions", [
    layout("routes/self-promotion/layout.tsx", [
      // ⚠ この行は必須。無いと /self-promotions/new が route(":id") にマッチし、
      //    「id = "new" の結果ページ」として解決されてしまう。
      route("new", "routes/self-promotion/new-index.tsx"),
      route("new/:step", "routes/self-promotion/new-step.tsx"),
      route(":id", "routes/self-promotion/result.tsx"),
    ]),
  ]),

  // 後続ツールはこのブロックを複製する:
  // ...prefix("motivations", [...]),
  // ...prefix("entry-sheets", [...]),
] satisfies RouteConfig;
