// Guards against rendering bracket placeholders (e.g. "[VIDEO URL NEEDED]")
// as live, clickable links — only an actual http(s) URL counts as real.
export function isRealUrl(value: string | undefined): value is string {
  return typeof value === "string" && /^https?:\/\//.test(value);
}
