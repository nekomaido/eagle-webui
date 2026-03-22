/**
 * Extract library ID from search params
 */
export function getLibraryIdFromParams(
  searchParams: Record<string, string | string[] | undefined> | undefined,
): string | undefined {
  if (!searchParams) {
    return undefined;
  }

  const libraryParam = searchParams["library"];
  if (typeof libraryParam === "string" && libraryParam.trim()) {
    return libraryParam.trim();
  }

  return undefined;
}

/**
 * Build URL with library query parameter
 */
export function buildLibraryUrl(
  pathname: string,
  libraryId: string | undefined,
  defaultLibraryId: string,
  existingParams?: URLSearchParams,
): string {
  const params = new URLSearchParams(existingParams?.toString() ?? "");

  // Only add library param if not default
  if (libraryId && libraryId !== defaultLibraryId) {
    params.set("library", libraryId);
  } else {
    params.delete("library");
  }

  const queryString = params.toString();
  return queryString ? `${pathname}?${queryString}` : pathname;
}

/**
 * Check if library param should be preserved in navigation
 */
export function shouldPreserveLibraryParam(
  libraryId: string | undefined,
  defaultLibraryId: string,
): boolean {
  return !!libraryId && libraryId !== defaultLibraryId;
}
