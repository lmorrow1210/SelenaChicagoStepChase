// GitHub Pages serves project sites under /<repo>/, so plain <a href="/x">
// anchors need the base path prefixed. next/navigation router calls and
// next/link handle this automatically; raw anchors do not.
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function withBase(path: string): string {
  if (!BASE_PATH) return path;
  return path.startsWith("/") ? `${BASE_PATH}${path}` : path;
}
