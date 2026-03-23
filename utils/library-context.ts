/**
 * Build URL with library path prefix
 *
 * Default library: /folders/abc
 * Non-default: /library/{id}/folders/abc
 */
export function buildLibraryUrl(
  path: string,
  libraryId: string | undefined,
  defaultLibraryId: string,
): string {
  // Normalize path - remove leading slash for joining
  const normalizedPath = path.startsWith("/") ? path.slice(1) : path;

  // Default library uses root routes
  if (!libraryId || libraryId === defaultLibraryId) {
    return normalizedPath ? `/${normalizedPath}` : "/";
  }

  // Non-default library uses /library/{id}/ prefix
  return normalizedPath
    ? `/library/${libraryId}/${normalizedPath}`
    : `/library/${libraryId}`;
}

/**
 * Check if we're in a non-default library context
 */
export function isNonDefaultLibrary(
  libraryId: string | undefined,
  defaultLibraryId: string,
): boolean {
  return !!libraryId && libraryId !== defaultLibraryId;
}

/**
 * Get library prefix for routes
 * Returns "/library/{id}" for non-default, "" for default
 */
export function getLibraryPrefix(
  libraryId: string | undefined,
  defaultLibraryId: string,
): string {
  if (!libraryId || libraryId === defaultLibraryId) {
    return "";
  }
  return `/library/${libraryId}`;
}
