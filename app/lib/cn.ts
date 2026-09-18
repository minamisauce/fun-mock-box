import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/** Tailwind クラスを条件付きで結合し、競合するユーティリティを後勝ちで解決する */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
