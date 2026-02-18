import type { DigestItem } from "../types/index.js";

export function renderDigestText(userEmail: string, items: DigestItem[]) {
  const lines = items.map((item) => {
    const summary = item.summary ? `\n  ${item.summary}` : "";
    return `${item.position}. ${item.title}\n  ${item.url}${summary}`;
  });

  return `Hello ${userEmail},\n\nHere is your News Agent digest:\n\n${lines.join("\n\n")}\n\nThanks,\nNews Agent`;
}

export function renderDigestHtml(userEmail: string, items: DigestItem[]) {
  const itemHtml = items
    .map(
      (item) => `<li style="margin-bottom:12px;">
        <a href="${item.url}"><strong>${escapeHtml(item.title)}</strong></a>
        ${item.summary ? `<p style="margin:4px 0 0 0;">${escapeHtml(item.summary)}</p>` : ""}
      </li>`
    )
    .join("\n");

  return `
    <div style="font-family:Arial,sans-serif;max-width:680px;margin:0 auto;">
      <h2>News Agent Digest</h2>
      <p>Hello ${escapeHtml(userEmail)},</p>
      <p>Here are your latest stories:</p>
      <ol>${itemHtml}</ol>
      <p style="margin-top:24px;">Thanks,<br/>News Agent</p>
    </div>
  `;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
