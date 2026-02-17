export type UserSubscriptionRow = {
  user_id: string;
  frequency: "daily" | "weekly";
  topic_id: string;
  locality: string;
};

export type CandidateRow = {
  article_id: string;
  title: string;
  url: string;
  summary: string | null;
  published_at: string | null;
  confidence: string;
  raw_location: string | null;
};

export type RankedCandidate = {
  articleId: string;
  score: number;
};
