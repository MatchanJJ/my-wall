import assert from "node:assert/strict";
import { test } from "node:test";
import { characterCount, messageError, mergePosts } from "../src/lib/posts.ts";

test("messages reject whitespace and over-limit text, including non-BMP characters", () => {
  for (const blank of ["", " \n\t", "\u00a0\u2003"]) assert.ok(messageError(blank));
  assert.equal(messageError(" Hello, wall! "), null);
  assert.equal(messageError("a".repeat(280)), null);
  assert.equal(messageError("😀".repeat(280)), null);
  assert.equal(characterCount("Hi 😀"), 4);
  assert.ok(messageError("a".repeat(281)));
  assert.ok(messageError("😀".repeat(281)));
});

const post = (id, created_at, body = id) => ({ id, created_at, body, author_name: "Wall Visitor" });

test("snapshot and Realtime races keep new posts and deduplicate insert responses", () => {
  const older = post("a", "2026-11-15T00:00:00Z");
  const newer = post("b", "2026-11-15T00:00:01Z");
  const original = [newer];
  assert.deepEqual(mergePosts(original, [older, newer]), [newer, older]);
  assert.deepEqual(original, [newer]);
});

test("timestamp ties have stable ID order, and timezone offsets sort by actual time", () => {
  const a = post("a", "2026-11-15T08:00:00+08:00");
  const b = post("b", "2026-11-15T00:00:00Z");
  const latest = post("c", "2026-11-15T00:00:01Z");
  assert.deepEqual(mergePosts([a], [latest, b]), [latest, b, a]);
});

test("Postgres microseconds keep genuinely newer posts first within one millisecond", () => {
  const older = post("z", "2026-11-15T00:00:00.100001+00:00");
  const newer = post("a", "2026-11-15T00:00:00.100002+00:00");
  assert.deepEqual(mergePosts([older], [newer]), [newer, older]);
  const equal = post("b", "2026-11-15T00:00:00.1Z");
  const zeroPadded = post("c", "2026-11-15T00:00:00.100000Z");
  assert.deepEqual(mergePosts([equal], [zeroPadded]), [zeroPadded, equal]);
});

test("loading another page preserves every older post", () => {
  const existing = Array.from({ length: 50 }, (_, i) => post(String(i), new Date(i * 1000).toISOString()));
  const incoming = [post("new", "2026-11-15T00:00:00Z"), ...existing];
  assert.equal(mergePosts(existing, incoming).length, 51);
});
