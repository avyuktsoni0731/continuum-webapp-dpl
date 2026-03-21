/**
 * Helpers for Unified Ops dashboard: shorten repo paths, strip AI markdown, parse metadata chips.
 */

/** Remove **bold**, *italic*, # headers from LLM output (no markdown dependency). */
export function stripAiMarkdown(text: string): string {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .trim();
}

/** Split brief into display lines (bullets or paragraphs). */
export function splitBriefLines(text: string): string[] {
  const t = stripAiMarkdown(text);
  return t
    .split(/\n+/)
    .map((l) => l.replace(/^[-•*]\s*/, "").trim())
    .filter(Boolean);
}

/** Shorten owner/repo for dense UI; full string kept for tooltips. */
export function shortRepoLabel(full: string, maxLen = 36): string {
  if (!full) return "";
  if (full.length <= maxLen) return full;
  const parts = full.split("/");
  if (parts.length >= 2) {
    const owner = parts[0];
    const repo = parts.slice(1).join("/");
    const o = owner.length > 10 ? owner.slice(0, 8) + "…" : owner;
    const r = repo.length > 16 ? repo.slice(0, 14) + "…" : repo;
    const s = `${o}/${r}`;
    return s.length <= maxLen ? s : full.slice(0, maxLen - 1) + "…";
  }
  return full.slice(0, maxLen - 1) + "…";
}

/** Parse "Event: x | Author: y | ..." into chips. */
export function parseSubtitleChips(subtitle: string): { label: string; value: string }[] {
  if (!subtitle) return [];
  const chips: { label: string; value: string }[] = [];
  for (const part of subtitle.split("|")) {
    const p = part.trim();
    const idx = p.indexOf(":");
    if (idx === -1) continue;
    const label = p.slice(0, idx).trim();
    const value = p.slice(idx + 1).trim();
    if (label && value) chips.push({ label, value });
  }
  return chips;
}

export type ParsedUnifiedId = {
  source: "jira" | "github";
  /** Primary label, e.g. KAN-1 or PR #12 */
  primary: string;
  /** Secondary, e.g. shortened repo */
  secondary?: string;
};

export function parseUnifiedId(id: string): ParsedUnifiedId {
  if (id.startsWith("jira:")) {
    return { source: "jira", primary: id.replace(/^jira:/, "") };
  }
  if (id.startsWith("github:")) {
    const rest = id.replace(/^github:/, "");
    const m = rest.match(/^(.+)#(\d+)$/);
    if (m) {
      return {
        source: "github",
        primary: `#${m[2]}`,
        secondary: shortRepoLabel(m[1]),
      };
    }
    return { source: "github", primary: rest };
  }
  return { source: "jira", primary: id };
}

/** Human label for Jira/GitHub event types */
export function eventLabel(raw: string): string {
  return raw.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
