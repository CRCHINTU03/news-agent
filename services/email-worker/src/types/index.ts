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

export type EmailJob = {
  id: string;
  digest_id: string;
  user_id: string;
  attempts: number;
  max_attempts: number;
};
