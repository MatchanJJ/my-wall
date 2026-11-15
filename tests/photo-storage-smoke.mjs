import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
assert.ok(url && key, "Configure the public Supabase URL and key first.");
const client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
const bucket = client.storage.from("wall-photos");
const { data: posts, error } = await client.from("posts").select("image_path")
  .eq("body", "A little snapshot of My Wall — photo uploads are here!")
  .not("image_path", "is", null).order("created_at", { ascending: false }).limit(1);
assert.ifError(error);
assert.ok(posts[0], "Share a photo through the app before running this check.");
const path = posts[0].image_path;
const publicUrl = bucket.getPublicUrl(path).data.publicUrl;
const original = await fetch(publicUrl, { cache: "no-store" });
assert.equal(original.status, 200);
assert.ok(original.headers.get("content-type").startsWith("image/"));
const originalBytes = Buffer.from(await original.arrayBuffer());
const fixture = await readFile(new URL("../artifacts/screenshots/my-wall-desktop.jpg", import.meta.url));
assert.deepEqual(originalBytes, fixture, "Run this check against the screenshot test post, not a visitor's photo.");

for (const invalid of [
  { path: `${randomUUID()}.jpg`, data: Buffer.alloc(5 * 1024 * 1024 + 1), type: "image/jpeg" },
  { path: `${randomUUID()}.jpg`, data: Buffer.from("<svg/>"), type: "image/svg+xml" },
  { path: "invalid-name.jpg", data: fixture, type: "image/jpeg" },
]) {
  const uploaded = await bucket.upload(invalid.path, invalid.data, { contentType: invalid.type });
  assert.ok(uploaded.error, `Storage accepted forbidden upload: ${invalid.type} / ${invalid.path}`);
}
const overwritten = await bucket.upload(path, fixture, { contentType: "image/jpeg", upsert: true });
assert.ok(overwritten.error, "Visitors must not overwrite existing photos.");
const removed = await bucket.remove([path]);
assert.ok(removed.error || removed.data?.length === 0, "Storage must not report a deleted photo.");
const after = await fetch(publicUrl, { cache: "no-store" });
assert.equal(after.status, 200, "Visitors must not delete existing photos.");
assert.deepEqual(Buffer.from(await after.arrayBuffer()), originalBytes);
for (const image_path of ["https://example.com/photo.jpg", "../private/photo.jpg", `${randomUUID()}.svg`]) {
  const rejected = await client.from("posts").insert({ body: "Invalid photo reference", image_path });
  assert.ok(rejected.error, "The database must reject arbitrary photo URLs and paths.");
}
console.log("Passed: public photo read, storage size/type/name limits, denied overwrite/delete, and safe post paths.");
