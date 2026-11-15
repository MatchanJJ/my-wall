import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
assert.ok(url && key, "Configure the Supabase public URL and key in .env.local first.");
const options = { auth: { persistSession: false, autoRefreshToken: false } };
const writer = createClient(url, key, options);
const reader = createClient(url, key, options);
const body = `Database smoke check ${randomUUID()}`;
let channel;
let timer;

try {
  let receive;
  const received = new Promise(resolve => { receive = resolve; });
  await new Promise((resolve, reject) => {
    timer = setTimeout(() => reject(new Error("Realtime subscription timed out")), 15000);
    channel = reader.channel(`smoke-${randomUUID()}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "posts" }, payload => {
        if (payload.new.body === body) receive(payload.new);
      })
      .subscribe((status, error) => {
        if (status === "SUBSCRIBED") { clearTimeout(timer); resolve(); }
        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") reject(new Error(status));
        if (error) console.error("Realtime:", error.message);
      });
  });

  const inserted = await writer.from("posts").insert({ body }).select().single();
  assert.ifError(inserted.error);
  assert.equal(inserted.data.author_name, "Wall Visitor");
  console.log(`Created diagnostic post: ${inserted.data.id}`);

  const event = await Promise.race([
    received,
    new Promise((_, reject) => { timer = setTimeout(() => reject(new Error("Realtime insert timed out")), 15000); }),
  ]);
  clearTimeout(timer);
  assert.equal(event.id, inserted.data.id);

  const persisted = await reader.from("posts").select().eq("id", inserted.data.id).single();
  assert.ifError(persisted.error);
  assert.equal(persisted.data.body, body);

  for (const invalid of ["", " \n\t ", "a".repeat(281), "😀".repeat(281), null]) {
    const { error } = await writer.from("posts").insert({ body: invalid });
    assert.ok(error, `Database accepted invalid message: ${JSON.stringify(invalid)}`);
  }
  for (const overrides of [{ author_name: "Someone else" }, { id: randomUUID() }, { created_at: "2008-01-01T00:00:00Z" }]) {
    const { error } = await writer.from("posts").insert({ body: "forbidden override", ...overrides });
    assert.ok(error, "Visitors must not set server-owned fields");
  }
  assert.ok((await writer.from("posts").update({ body: "changed" }).eq("id", inserted.data.id)).error);
  assert.ok((await writer.from("posts").delete().eq("id", inserted.data.id)).error);
  const unchanged = await reader.from("posts").select().eq("id", inserted.data.id).single();
  assert.equal(unchanged.data?.body, body);
  console.log("Passed: public insert/read, independent-client persistence, Realtime, validation, and denied overrides/update/delete.");
  console.log("The diagnostic post remains visible; an administrator can remove the ID printed above.");
} finally {
  clearTimeout(timer);
  if (channel) await reader.removeChannel(channel);
}
