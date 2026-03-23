"use client";

import { usePathname } from "next/navigation";
import { useMemo } from "react";

/**
 * Hook to get the current library ID from the URL path.
 *
 * URL patterns:
 * - /                          → default library
 * - /folders/abc               → default library
 * - /library/test2             → test2 library
 * - /library/test2/folders/abc → test2 library
 */
export function useCurrentLibraryId(): string | null {
  const pathname = usePathname();

  return useMemo(() => {
    if (!pathname) return null;

    // Check if URL starts with /library/{id}
    const libraryMatch = pathname.match(/^\/library\/([^/]+)/);
    if (libraryMatch) {
      return libraryMatch[1];
    }

    // Otherwise, it's the default library (root routes)
    return null;
  }, [pathname]);
}

/**
 * Hook to get the resolved library ID (current or default)
 */
export function useResolvedLibraryId(): string {
  const currentLibraryId = useCurrentLibraryId();
  // For SSR, we need to handle the case where getDefaultLibraryId is async
  // This hook should be used in components that are rendered after the library is loaded
  return currentLibraryId ?? "";
}

/**
 * Check if we're viewing the default library
 */
export function useIsDefaultLibrary(): boolean {
  const currentLibraryId = useCurrentLibraryId();
  return currentLibraryId === null;
}
