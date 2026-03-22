import {
  type LibraryImportErrorCode,
  toLibraryImportErrorCode,
} from "./errors";
import {
  getDefaultLibraryId,
  getLibraryPath,
  loadLibraryConfig,
  type LibraryDefinition,
} from "./library-config";
import { importLibraryMetadata } from "./library/import-metadata";
import { loadGlobalSortSettings } from "./settings";
import type { SmartFolder, SmartFolderItemMap } from "./smart-folders";
import { type SortContext, sortItems } from "./sort-items";
import type { FolderSortMethod, GlobalSortOptions } from "./sort-options";
import type { Folder, Item, ItemCounts, ItemPreview } from "./types";

export class Store {
  constructor(
    public readonly libraryId: string,
    public readonly libraryPath: string,
    public readonly applicationVersion: string,
    public readonly folders: Map<string, Folder>,
    public readonly items: Map<string, Item>,
    public readonly smartFolders: SmartFolder[],
    public readonly smartFolderItemIds: SmartFolderItemMap,
    public readonly globalSortSettings: GlobalSortOptions,
    public readonly itemCounts: ItemCounts,
  ) {}

  getFolders(): Folder[] {
    return Array.from(this.folders.values());
  }

  getItems(search?: string, tag?: string): Item[] {
    const items: Item[] = [];

    for (const item of this.items.values()) {
      if (!item.isDeleted) {
        items.push(item);
      }
    }

    const sorted = sortItems(items, this.getGlobalSortContext());
    return this.filterItems(sorted, search, tag);
  }

  getItemPreviews(search?: string, tag?: string): ItemPreview[] {
    return this.toItemPreviews(this.getItems(search, tag));
  }

  getUncategorizedItems(search?: string, tag?: string): Item[] {
    const items: Item[] = [];

    for (const item of this.items.values()) {
      if (item.isDeleted) {
        continue;
      }

      if (item.folders.length === 0) {
        items.push(item);
      }
    }

    const sorted = sortItems(items, this.getGlobalSortContext());
    return this.filterItems(sorted, search, tag);
  }

  getUncategorizedItemPreviews(search?: string, tag?: string): ItemPreview[] {
    return this.toItemPreviews(this.getUncategorizedItems(search, tag));
  }

  getTrashItems(search?: string, tag?: string): Item[] {
    const items: Item[] = [];

    for (const item of this.items.values()) {
      if (item.isDeleted) {
        items.push(item);
      }
    }

    const sorted = sortItems(items, this.getGlobalSortContext());
    return this.filterItems(sorted, search, tag);
  }

  getTrashItemPreviews(search?: string, tag?: string): ItemPreview[] {
    return this.toItemPreviews(this.getTrashItems(search, tag));
  }

  getSmartFolders(): SmartFolder[] {
    return this.smartFolders;
  }

  getSmartFolder(id: string): SmartFolder | undefined {
    return this.findSmartFolder(this.smartFolders, id);
  }

  getSmartFolderItemIds(id: string): string[] {
    const itemIds = this.smartFolderItemIds.get(id);
    return itemIds ? [...itemIds] : [];
  }

  getSmartFolderItemCount(id: string): number {
    const folder = this.getSmartFolder(id);
    return folder?.itemCount ?? 0;
  }

  getSmartFolderCoverId(id: string): string | undefined {
    const folder = this.getSmartFolder(id);
    return folder?.coverId;
  }

  updateSmartFolderSortOptions(
    smartFolderId: string,
    orderBy: FolderSortMethod,
    sortIncrease: boolean,
  ): boolean {
    const folder = this.getSmartFolder(smartFolderId);
    if (!folder) {
      return false;
    }

    folder.orderBy = orderBy;
    folder.sortIncrease = sortIncrease;

    const existingIds = this.smartFolderItemIds.get(smartFolderId) ?? [];
    const resolvedItems: Item[] = [];

    for (const itemId of existingIds) {
      const item = this.items.get(itemId);
      if (item && !item.isDeleted) {
        resolvedItems.push(item);
      }
    }

    const resolvedOrderBy =
      orderBy === "GLOBAL" ? this.globalSortSettings.orderBy : orderBy;
    const resolvedSortIncrease =
      orderBy === "GLOBAL"
        ? this.globalSortSettings.sortIncrease
        : sortIncrease;

    let sortedItems: Item[];
    try {
      sortedItems = sortItems(resolvedItems, {
        orderBy: resolvedOrderBy,
        sortIncrease: resolvedSortIncrease,
        folderId: smartFolderId,
      });
    } catch {
      sortedItems = resolvedItems;
    }

    const sortedIds = sortedItems.map((item) => item.id);
    this.smartFolderItemIds.set(smartFolderId, sortedIds);
    folder.itemCount = sortedIds.length;

    if (sortedIds.length === 0) {
      folder.coverId = undefined;
      return true;
    }

    if (folder.coverId && sortedIds.includes(folder.coverId)) {
      return true;
    }

    folder.coverId = sortedIds[0];
    return true;
  }

  getSmartFolderItemPreviews(
    id: string,
    search?: string,
    tag?: string,
  ): ItemPreview[] {
    const folder = this.getSmartFolder(id);
    if (!folder) {
      return [];
    }

    const itemIds = this.smartFolderItemIds.get(id) ?? [];
    const items = this.collectItemsByIds(itemIds);
    const filtered = this.filterItems(items, search, tag);
    return this.toItemPreviews(filtered);
  }

  getFirstSmartFolderItem(id: string): Item | undefined {
    const itemIds = this.smartFolderItemIds.get(id);
    if (!itemIds) {
      return undefined;
    }

    for (const itemId of itemIds) {
      const item = this.items.get(itemId);
      if (item && !item.isDeleted) {
        return item;
      }
    }

    return undefined;
  }

  getFolderItems(folderId: string, search?: string, tag?: string): Item[] {
    const items: Item[] = [];

    for (const item of this.items.values()) {
      if (item.isDeleted) {
        continue;
      }

      if (item.folders.includes(folderId)) {
        items.push(item);
      }
    }

    const folder = this.folders.get(folderId);
    const sortContext = this.resolveFolderSortContext(folder);

    const sorted = sortItems(items, { ...sortContext, folderId });
    return this.filterItems(sorted, search, tag);
  }

  getFolderItemPreviews(
    folderId: string,
    search?: string,
    tag?: string,
  ): ItemPreview[] {
    return this.toItemPreviews(this.getFolderItems(folderId, search, tag));
  }

  getFirstFolderItem(folderId: string): Item | undefined {
    for (const item of this.items.values()) {
      if (item.isDeleted) {
        continue;
      }

      if (item.folders.includes(folderId)) {
        return item;
      }
    }

    return undefined;
  }

  private filterItems(items: Item[], search?: string, tag?: string): Item[] {
    const filteredByTag = this.filterItemsByTag(items, tag);
    return this.filterItemsBySearch(filteredByTag, search);
  }

  private filterItemsByTag(items: Item[], tag?: string): Item[] {
    const normalized = this.normalizeTag(tag);
    if (!normalized) {
      return items;
    }

    return items.filter((item) =>
      item.tags.some((itemTag) => itemTag === normalized),
    );
  }

  private filterItemsBySearch(items: Item[], search?: string): Item[] {
    const terms = this.parseSearchTerms(search);
    if (terms.length === 0) {
      return items;
    }

    return items.filter((item) => this.matchesSearch(item, terms));
  }

  private parseSearchTerms(search?: string): string[] {
    if (!search) {
      return [];
    }

    return search
      .trim()
      .toLowerCase()
      .split(/\s+/)
      .filter((term) => term.length > 0);
  }

  private matchesSearch(item: Item, terms: string[]): boolean {
    if (terms.length === 0) {
      return true;
    }

    const haystacks: string[] = [];
    const pushValue = (value: string | undefined) => {
      if (!value) {
        return;
      }

      const normalized = value.trim().toLowerCase();
      if (normalized.length > 0) {
        haystacks.push(normalized);
      }
    };

    pushValue(item.name);
    pushValue(item.ext);
    pushValue(item.url);
    pushValue(item.annotation);

    for (const tag of item.tags) {
      pushValue(tag);
    }

    if (item.comments) {
      for (const comment of item.comments) {
        pushValue(comment.annotation);
      }
    }

    for (const folderId of item.folders) {
      const folder = this.folders.get(folderId);
      if (!folder) {
        continue;
      }

      pushValue(folder.name);
      pushValue(folder.description);
    }

    if (haystacks.length === 0) {
      return false;
    }

    return terms.every((term) =>
      haystacks.some((haystack) => haystack.includes(term)),
    );
  }

  private resolveFolderSortContext(folder: Folder | undefined): SortContext {
    if (!folder || folder.orderBy === "GLOBAL") {
      return {
        orderBy: this.globalSortSettings.orderBy,
        sortIncrease: this.globalSortSettings.sortIncrease,
      };
    }

    return {
      orderBy: folder.orderBy,
      sortIncrease: folder.sortIncrease,
    };
  }

  private getGlobalSortContext(): SortContext {
    return {
      orderBy: this.globalSortSettings.orderBy,
      sortIncrease: this.globalSortSettings.sortIncrease,
    };
  }

  private findSmartFolder(
    nodes: SmartFolder[],
    id: string,
  ): SmartFolder | undefined {
    for (const node of nodes) {
      if (node.id === id) {
        return node;
      }

      const child = this.findSmartFolder(node.children, id);
      if (child) {
        return child;
      }
    }

    return undefined;
  }

  private collectItemsByIds(itemIds: string[]): Item[] {
    const collected: Item[] = [];

    for (const itemId of itemIds) {
      const item = this.items.get(itemId);
      if (item && !item.isDeleted) {
        collected.push(item);
      }
    }

    return collected;
  }

  private toItemPreviews(items: Item[]): ItemPreview[] {
    return items.map(({ id, duration, width, height, ext }) => ({
      id,
      duration,
      width,
      height,
      ext,
    }));
  }

  private normalizeTag(tag?: string): string | undefined {
    if (!tag) {
      return undefined;
    }

    const trimmed = tag.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  }
}

export function computeItemCounts(
  items: Map<string, Item>,
  folders: Map<string, Folder>,
): ItemCounts {
  let all = 0;
  let uncategorized = 0;
  let trash = 0;

  const folderCounts = new Map<string, number>();

  for (const folderId of folders.keys()) {
    folderCounts.set(folderId, 0);
  }

  for (const item of items.values()) {
    if (item.isDeleted) {
      trash += 1;
      continue;
    }

    all += 1;

    if (item.folders.length === 0) {
      uncategorized += 1;
      continue;
    }

    if (item.folders.length === 1) {
      const folderId = item.folders[0];
      const existing = folderCounts.get(folderId);
      if (existing !== undefined) {
        folderCounts.set(folderId, existing + 1);
      }
      continue;
    }

    const uniqueFolderIds = new Set(item.folders);

    for (const folderId of uniqueFolderIds) {
      const existing = folderCounts.get(folderId);
      if (existing !== undefined) {
        folderCounts.set(folderId, existing + 1);
      }
    }
  }

  for (const [folderId, count] of folderCounts) {
    const folder = folders.get(folderId);
    if (folder) {
      folder.itemCount = count;
    }
  }

  return {
    all,
    uncategorized,
    trash,
  };
}

export type StoreInitializationState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ready" }
  | { status: "error"; code: LibraryImportErrorCode };

// Store Registry for multi-library support
type StoreEntry = {
  promise: Promise<Store> | null;
  state: StoreInitializationState;
};

class StoreRegistry {
  private stores: Map<string, StoreEntry> = new Map();
  private defaultLibraryId: string | null = null;

  async getStore(libraryId?: string): Promise<Store> {
    const id = await this.resolveLibraryId(libraryId);

    if (!this.stores.has(id)) {
      this.stores.set(id, {
        promise: null,
        state: { status: "idle" },
      });
    }

    const entry = this.stores.get(id)!;

    if (!entry.promise) {
      entry.state = { status: "loading" };

      entry.promise = (async () => {
        try {
          const store = await this.initializeStore(id);
          entry.state = { status: "ready" };
          return store;
        } catch (error) {
          const code = toLibraryImportErrorCode(error);
          entry.state = { status: "error", code };
          throw error;
        }
      })();
    }

    return entry.promise;
  }

  getStoreImportState(libraryId?: string): StoreInitializationState {
    // If no stores exist yet, return idle
    if (this.stores.size === 0) {
      return { status: "idle" };
    }

    const id = libraryId ?? this.defaultLibraryId;
    if (!id) {
      // Return the state of the first store if no ID specified
      const firstEntry = this.stores.values().next().value;
      return firstEntry?.state ?? { status: "idle" };
    }

    const entry = this.stores.get(id);
    return entry?.state ?? { status: "idle" };
  }

  getAllStoreStates(): Map<string, StoreInitializationState> {
    const states = new Map<string, StoreInitializationState>();
    for (const [id, entry] of this.stores) {
      states.set(id, entry.state);
    }
    return states;
  }

  resetStore(libraryId?: string): void {
    if (libraryId) {
      this.stores.delete(libraryId);
    } else {
      this.stores.clear();
      this.defaultLibraryId = null;
    }
  }

  private async resolveLibraryId(libraryId?: string): Promise<string> {
    if (libraryId) {
      return libraryId;
    }

    if (this.defaultLibraryId) {
      return this.defaultLibraryId;
    }

    this.defaultLibraryId = await getDefaultLibraryId();
    return this.defaultLibraryId;
  }

  private async initializeStore(libraryId: string): Promise<Store> {
    const libraryPath = await getLibraryPath(libraryId);
    const globalSortSettings = await loadGlobalSortSettings();
    const data = await importLibraryMetadata(libraryPath, globalSortSettings);
    const itemCounts = computeItemCounts(data.items, data.folders);

    return new Store(
      libraryId,
      data.libraryPath,
      data.applicationVersion,
      data.folders,
      data.items,
      data.smartFolders,
      data.smartFolderItemIds,
      globalSortSettings,
      itemCounts,
    );
  }
}

const storeRegistry = new StoreRegistry();

// Exported functions for backward compatibility and new multi-library access
export function getStoreImportState(libraryId?: string): StoreInitializationState {
  return storeRegistry.getStoreImportState(libraryId);
}

export async function getStore(libraryId?: string): Promise<Store> {
  return storeRegistry.getStore(libraryId);
}

export async function waitForStoreInitialization(libraryId?: string): Promise<void> {
  const id = libraryId ?? (await getDefaultLibraryId());
  const state = storeRegistry.getStoreImportState(id);

  if (state.status === "idle") {
    // Trigger initialization
    try {
      await storeRegistry.getStore(id);
    } catch {
      // Swallow errors; state is already updated
    }
  }
}

export function resetStore(libraryId?: string): void {
  storeRegistry.resetStore(libraryId);
}

// Library config helpers
export async function getLibraryDefinitions(): Promise<LibraryDefinition[]> {
  const config = await loadLibraryConfig();
  return config.libraries;
}

export const __resetStoreForTests = resetStore;
