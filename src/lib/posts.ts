import type { Database } from "./database.types";

export type Post = Database["public"]["Tables"]["posts"]["Row"];
export const MAX_MESSAGE_LENGTH = 280;

export function characterCount(value: string) {
  return Array.from(value).length;
}

export function messageError(value: string) {
  if (!value.trim()) return "Write a message before sharing.";
  if (characterCount(value) > MAX_MESSAGE_LENGTH) return "Keep your message to 280 characters.";
  return null;
}

function fractionalSeconds(timestamp: string) {
  // Date.parse drops Postgres' microseconds, which still determine feed order.
  return (timestamp.match(/\.(\d+)/)?.[1] ?? "").padEnd(6, "0");
}

export function mergePosts(current: Post[], incoming: Post[]) {
  const unique = new Map([...current, ...incoming].map(post => [post.id, post]));
  return [...unique.values()].sort((a, b) =>
    Date.parse(b.created_at) - Date.parse(a.created_at)
    || fractionalSeconds(b.created_at).localeCompare(fractionalSeconds(a.created_at))
    || b.id.localeCompare(a.id),
  );
}
