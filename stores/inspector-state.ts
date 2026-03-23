import { create } from "zustand";

type CollectionType = "all" | "uncategorized" | "trash";

type InspectorContext =
  | { kind: "none" }
  | { kind: "folder"; folderId: string; folder: unknown; totalSize: number }
  | {
      kind: "collection";
      type: CollectionType;
      itemCount: number;
      totalSize: number;
    }
  | { kind: "item"; itemId: string };

type InspectorState = {
  context: InspectorContext;
  setContext: (context: InspectorContext) => void;
  inspectFolder: (folderId: string, folder: unknown, totalSize: number) => void;
  inspectCollection: (
    type: CollectionType,
    itemCount: number,
    totalSize: number,
  ) => void;
  inspectItem: (itemId?: string) => void;
  clearInspector: () => void;
};

export const useInspectorState = create<InspectorState>((set) => ({
  context: { kind: "none" },
  setContext: (context) => set({ context }),
  inspectFolder: (folderId, folder, totalSize) =>
    set({ context: { kind: "folder", folderId, folder, totalSize } }),
  inspectCollection: (type, itemCount, totalSize) =>
    set({ context: { kind: "collection", type, itemCount, totalSize } }),
  inspectItem: (itemId) =>
    set({ context: itemId ? { kind: "item", itemId } : { kind: "none" } }),
  clearInspector: () => set({ context: { kind: "none" } }),
}));
