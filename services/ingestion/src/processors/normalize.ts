import { createHash } from "node:crypto";
import type { NormalizedArticle } from "../types.js";

function inferTopicSlugs(text: string): string[] {
  const haystack = text.toLowerCase();
  const topicRules: Record<string, string[]> = {
    technology: ["ai", "software", "startup", "tech", "cloud", "chip"],
    business: ["market", "stocks", "economy", "revenue", "finance"],
    sports: ["match", "league", "goal", "tournament", "nba", "nfl"],
    politics: ["election", "policy", "government", "senate", "congress"],
    health: ["health", "hospital", "vaccine", "disease", "medical"]
  };

  const matched = Object.entries(topicRules)
    .filter(([, keywords]) => keywords.some((keyword) => haystack.includes(keyword)))
    .map(([slug]) => slug);

  if (!matched.length) {
    matched.push("local-news");
  }

  return matched;
}

export function normalizeRssItem(item: Record<string, unknown>): NormalizedArticle | null {
  const title = typeof item.title === "string" ? item.title.trim() : "";
  const url =
    typeof item.link === "string" ? item.link.trim() :
    typeof item.guid === "string" ? item.guid.trim() : "";

  if (!title || !url) {
    return null;
  }

  const summaryRaw =
    typeof item.contentSnippet === "string" ? item.contentSnippet :
    typeof item.content === "string" ? item.content :
    typeof item.summary === "string" ? item.summary : "";

  const summary = summaryRaw.trim() || null;
  const payloadForHash = `${title}|${url}|${summary ?? ""}`;
  const contentHash = createHash("sha256").update(payloadForHash).digest("hex");

  const publishedAtRaw =
    typeof item.isoDate === "string" ? item.isoDate :
    typeof item.pubDate === "string" ? item.pubDate : null;

  const publishedAt = publishedAtRaw ? new Date(publishedAtRaw).toISOString() : null;
  const topicSlugs = inferTopicSlugs(`${title} ${summary ?? ""}`);

  return {
    title,
    url,
    summary,
    contentHash,
    publishedAt,
    language: null,
    rawLocation: null,
    topicSlugs
  };
}
