import assert from "node:assert/strict";
import { test } from "node:test";
import { MAX_PHOTO_BYTES, PHOTO_TYPES, photoError } from "../src/lib/photos.ts";

test("photos allow only JPEG, PNG, and WebP, including the exact 5 MB boundary", () => {
  for (const type of PHOTO_TYPES.keys()) {
    assert.equal(photoError({ type, size: 1 }), null);
    assert.equal(photoError({ type, size: MAX_PHOTO_BYTES }), null);
  }
  assert.ok(photoError({ type: "image/jpeg", size: MAX_PHOTO_BYTES + 1 }));
  assert.ok(photoError({ type: "image/png", size: 0 }));
});

test("photos reject active content, unsupported images, and missing MIME types", () => {
  for (const type of ["image/svg+xml", "image/gif", "text/html", "application/pdf", "", "toString"]) {
    assert.ok(photoError({ type, size: 123 }));
  }
  assert.equal(PHOTO_TYPES.get("image/jpeg"), "jpg");
});
