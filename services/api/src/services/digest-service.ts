import { listDigestItems, listSentDigestsByUser } from "../repositories/digest-repository.js";

export async function getDigestHistory(userId: number, limit = 20) {
  const digests = await listSentDigestsByUser(userId, limit);
  const digestIds = digests.map((d) => d.id);
  const items = await listDigestItems(digestIds);

  const itemsByDigest = new Map<string, typeof items>();
  for (const item of items) {
    const existing = itemsByDigest.get(item.digest_id) ?? [];
    existing.push(item);
    itemsByDigest.set(item.digest_id, existing);
  }

  return digests.map((digest) => ({
    id: digest.id,
    status: digest.status,
    sentAt: digest.sent_at,
    createdAt: digest.created_at,
    items: itemsByDigest.get(digest.id) ?? []
  }));
}
