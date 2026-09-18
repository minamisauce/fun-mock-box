import { ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { cn } from "~/lib/cn";
import { paths } from "~/lib/paths";
import { TOOL_THEME, type ToolId } from "~/lib/toolTheme";
import { listMotivations } from "~/mocks/motivation";
import { listSelfPromotions } from "~/mocks/selfPromotion";
import type { ToolResultModel } from "~/mocks/store";

export function meta() {
  return [
    { title: "就活BOX ツールモック | fun-mock-box" },
    {
      name: "description",
      content: "自己PR・志望動機・ES作成ツールのモック",
    },
  ];
}

type ToolCard = {
  id: ToolId;
  name: string;
  description: string;
  to: string | null;
};

/** 保存リストでどのツールの文章かを示すラベル */
const TOOL_LABEL: Record<ToolId, string> = {
  "self-promotion": "自己PR",
  motivation: "志望動機",
  "entry-sheet": "ES",
};

const TOOLS: ToolCard[] = [
  {
    id: "self-promotion",
    name: "自己PR作成",
    description: "4つの質問に答えるだけで自己PRが完成します",
    to: paths.selfPromotionsNew,
  },
  {
    id: "motivation",
    name: "志望動機作成",
    description: "業界・業種から志望動機を組み立てます",
    to: paths.motivationsNew,
  },
  {
    id: "entry-sheet",
    name: "ES作成・添削",
    description: "設問と企業名からESを作成・添削します",
    to: null,
  },
];

type SavedItem = ToolResultModel & { toolId: ToolId; href: string };

export default function Home() {
  const [saved, setSaved] = useState<SavedItem[]>([]);

  // localStorage は SPA モードなのでマウント後に読む
  useEffect(() => {
    const items: SavedItem[] = [
      ...listSelfPromotions().map((item) => ({
        ...item,
        toolId: "self-promotion" as const,
        href: paths.selfPromotion(item.id),
      })),
      ...listMotivations().map((item) => ({
        ...item,
        toolId: "motivation" as const,
        href: paths.motivation(item.id),
      })),
    ].sort((a, b) => b.created_at.localeCompare(a.created_at));
    setSaved(items);
  }, []);

  return (
    <div className="min-h-dvh bg-gray-1">
      <div className="mx-auto flex min-h-dvh w-full flex-col gap-xxl bg-white px-md py-xxl sm:w-tool sm:shadow-all-sides">
        <header className="flex flex-col gap-xs">
          <h1 className="text-xl font-bold leading-sm">就活BOX ツール</h1>
          <p className="text-xs text-font-gray">
            バックエンドなしで動くモックです
          </p>
        </header>

        <section className="flex flex-col gap-sm">
          {TOOLS.map((tool) => {
            const theme = TOOL_THEME[tool.id];
            const card = (
              <div
                className={cn(
                  "flex flex-col gap-xxs rounded-lg border-2 p-md",
                  tool.to
                    ? cn(theme.border, "bg-white")
                    : "border-border-2 bg-gray-1",
                )}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={cn(
                      "text-md font-bold",
                      tool.to ? theme.text : "text-font-gray",
                    )}
                  >
                    {tool.name}
                  </span>
                  {tool.to ? (
                    <ChevronRight
                      size={24}
                      aria-hidden
                      className="text-font-gray"
                    />
                  ) : (
                    <span className="rounded-infinity bg-gray-3 px-xs py-3xs text-xxs text-font-gray">
                      準備中
                    </span>
                  )}
                </div>
                <p className="text-xs leading-md text-font-gray">
                  {tool.description}
                </p>
              </div>
            );

            return tool.to ? (
              <Link key={tool.id} to={tool.to} className="hover:opacity-60">
                {card}
              </Link>
            ) : (
              <div key={tool.id}>{card}</div>
            );
          })}
        </section>

        {saved.length > 0 && (
          <section className="flex flex-col gap-sm">
            <h2 className="text-md font-bold">作成した文章</h2>
            <ul className="flex flex-col gap-xs">
              {saved.map((item) => (
                <li key={item.id}>
                  <Link
                    to={item.href}
                    className="flex flex-col gap-3xs rounded-md border border-border-2 p-sm hover:opacity-60"
                  >
                    <span
                      className={cn(
                        "text-xxs font-bold",
                        TOOL_THEME[item.toolId].text,
                      )}
                    >
                      {TOOL_LABEL[item.toolId]}
                    </span>
                    <span className="text-sm font-bold">{item.title}</span>
                    <span className="line-clamp-2 text-xs text-font-gray">
                      {item.content}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
