function decodeXml(text: string): string {
  return text
    .replace(/<!\[CDATA\[(.*?)\]\]>/gs, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'");
}

function extractTagValue(input: string, tag: string): string | null {
  const pattern = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i");
  const match = input.match(pattern);
  if (!match) {
    return null;
  }
  return decodeXml(match[1].trim());
}

export async function fetchRssItems(feedUrl: string) {
  const response = await fetch(feedUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch RSS feed: ${response.status}`);
  }

  const xml = await response.text();
  const itemBlocks = xml.match(/<item[\s\S]*?<\/item>/gi) ?? [];

  return itemBlocks.map((itemXml) => ({
    title: extractTagValue(itemXml, "title"),
    link: extractTagValue(itemXml, "link"),
    content: extractTagValue(itemXml, "description"),
    contentSnippet: extractTagValue(itemXml, "description"),
    pubDate: extractTagValue(itemXml, "pubDate"),
    guid: extractTagValue(itemXml, "guid")
  }));
}
