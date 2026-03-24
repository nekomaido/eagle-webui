import type { ReactNode } from "react";
import { AppLayout } from "@/components/AppLayout";
import {
  getDefaultLibraryId,
  getLibraryDefinitions,
} from "@/data/library-config";
import { loadNavbarExpandedState } from "@/data/settings";
import { getStore } from "@/data/store";

type LibraryLayoutProps = {
  children: ReactNode;
  params: Promise<{
    libraryId: string;
  }>;
};

export default async function LibraryLayout({
  children,
  params,
}: LibraryLayoutProps) {
  const { libraryId } = await params;
  const defaultLibraryId = await getDefaultLibraryId();
  const [store, navbarExpandedState, libraries] = await Promise.all([
    getStore(libraryId),
    loadNavbarExpandedState(),
    getLibraryDefinitions(),
  ]);

  return (
    <AppLayout
      folders={store.getFolders()}
      itemCounts={store.itemCounts}
      libraries={libraries}
      defaultLibraryId={defaultLibraryId}
      currentLibraryId={store.libraryId}
      smartFolders={store.getSmartFolders()}
      initialNavbarExpandedState={navbarExpandedState}
    >
      {children}
    </AppLayout>
  );
}
