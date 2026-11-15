export const PHOTO_BUCKET = "wall-photos";
export const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
export const PHOTO_TYPES = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);

export function photoError(file: Pick<File, "size" | "type">) {
  if (!PHOTO_TYPES.has(file.type)) return "Choose a JPG, PNG, or WebP photo.";
  if (file.size === 0) return "This photo is empty. Please choose another.";
  if (file.size > MAX_PHOTO_BYTES) return "Choose a photo smaller than or equal to 5 MB.";
  return null;
}
