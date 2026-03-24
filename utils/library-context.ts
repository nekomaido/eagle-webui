const GLOBAL_ROUTES = new Set(["/settings"]);

/**
 * Build URL with library path prefix
 */
export function buildLibraryUrl(
  path: string,
  libraryId: string | undefined,
  defaultLibraryId: string,
): string {
  if (path.startsWith("/library/")) {
    return path;
  }

  if (GLOBAL_ROUTES.has(path)) {
    return path;
  }

  const resolvedLibraryId = libraryId ?? defaultLibraryId;
  const normalizedPath = path.startsWith("/") ? path.slice(1) : path;

  return normalizedPath
    ? `/library/${resolvedLibraryId}/${normalizedPath}`
    : `/library/${resolvedLibraryId}`;
}
