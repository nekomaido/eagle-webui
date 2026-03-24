import type { ItemPreview } from "@/data/types";

const IMAGE_EXTENSIONS = new Set([
  "avif",
  "bmp",
  "gif",
  "heic",
  "heif",
  "ico",
  "jpeg",
  "jpg",
  "png",
  "svg",
  "tif",
  "tiff",
  "webp",
]);

const VIDEO_EXTENSIONS = new Set([
  "avi",
  "flv",
  "m4v",
  "mkv",
  "mov",
  "mp4",
  "mpeg",
  "mpg",
  "webm",
  "wmv",
]);

export type ItemMediaKind =
  | "image"
  | "thumbnailOnly"
  | "unsupported"
  | "url"
  | "video";

export function getImageUrl(itemId: string, libraryPath: string): string {
  const params = new URLSearchParams({
    id: itemId,
    libraryPath,
  });
  return `/api/items/image?${params.toString()}`;
}

export function getThumbnailUrl(itemId: string, libraryPath: string): string {
  const params = new URLSearchParams({
    id: itemId,
    libraryPath,
  });
  return `/api/items/thumbnail?${params.toString()}`;
}

export function classifyItemMedia(item: ItemPreview): ItemMediaKind {
  const ext = normalizeExtension(item.ext);

  if (ext === "url") {
    return "url";
  }

  if (item.duration > 0 || VIDEO_EXTENSIONS.has(ext)) {
    return "video";
  }

  if (ext === "json") {
    return "thumbnailOnly";
  }

  if (IMAGE_EXTENSIONS.has(ext)) {
    return "image";
  }

  return "unsupported";
}

export function getExtensionLabel(ext: string): string {
  return ext.trim().toUpperCase();
}

function normalizeExtension(ext: string): string {
  return ext.trim().toLowerCase();
}
