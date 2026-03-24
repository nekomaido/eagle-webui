import { createHash } from "node:crypto";
import { getLibraryName } from "./get-library-name";

const HASH_LENGTH = 8;

export function createLibraryId(libraryPath: string): string {
  const libraryName = getLibraryName(libraryPath);
  const slug = slugifyLibraryName(libraryName);
  const hash = createHash("sha256")
    .update(libraryName)
    .digest("hex")
    .slice(0, HASH_LENGTH);

  return slug ? `${slug}-${hash}` : hash;
}

function slugifyLibraryName(name: string): string {
  return name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
