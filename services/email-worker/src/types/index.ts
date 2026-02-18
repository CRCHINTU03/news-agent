export type PendingDigest = {
  digest_id: string;
  user_id: string;
  user_email: string;
  scheduled_for: string;
};

export type DigestItem = {
  article_id: string;
  title: string;
  url: string;
  summary: string | null;
  position: number;
  rank_score: string;
};
