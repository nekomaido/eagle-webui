"use server";

import {
  type LibraryImportErrorCode,
  toLibraryImportErrorCode,
} from "@/data/errors";
import { getStore, resetStore, waitForStoreInitialization } from "@/data/store";

export type ReloadLibraryResult =
  | { ok: true }
  | { ok: false; code: LibraryImportErrorCode };

export async function reloadLibrary(libraryId?: string): Promise<ReloadLibraryResult> {
  await waitForStoreInitialization(libraryId);
  resetStore(libraryId);

  try {
    await getStore(libraryId);
    return { ok: true };
  } catch (error) {
    const code = toLibraryImportErrorCode(error);
    return { ok: false, code };
  }
}
