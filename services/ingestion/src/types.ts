export type Source = {
  id: string;
  name: string;
  type: "rss" | "api";
  url: string;
};

export type NormalizedArticle = {
  title: string;
  url: string;
  summary: string | null;
  contentHash: string;
  publishedAt: string | null;
  language: string | null;
  rawLocation: string | null;
  topicSlugs: string[];
};
