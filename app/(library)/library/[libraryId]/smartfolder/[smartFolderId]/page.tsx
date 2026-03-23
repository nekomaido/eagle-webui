import { notFound } from "next/navigation";
import CollectionPage from "@/components/CollectionPage";
import { getDefaultLibraryId } from "@/data/library-config";
import { loadListScaleSetting } from "@/data/settings";
import { getStore } from "@/data/store";
import { resolveSearchQuery, resolveTagFilter } from "@/utils/search-query";

export const dynamic = "force-dynamic";

type SmartFolderPageProps = {
  params: Promise<Record<string, string>>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SmartFolderPage({
  params,
  searchParams,
}: SmartFolderPageProps) {
  const { libraryId, smartFolderId } = await params;
  const resolvedSearchParams = await searchParams;
  const defaultLibraryId = await getDefaultLibraryId();

  const [store, listScale] = await Promise.all([
    getStore(libraryId),
    loadListScaleSetting(),
  ]);
  const folder = store.getSmartFolder(smartFolderId);

  if (!folder) {
    notFound();
  }

  const search = resolveSearchQuery(resolvedSearchParams?.search);
  const tag = resolveTagFilter(resolvedSearchParams?.tag);
  const items = store.getSmartFolderItemPreviews(smartFolderId, search, tag);

  return (
    <CollectionPage
      title={folder.name}
      libraryPath={store.libraryPath}
      libraryId={libraryId}
      defaultLibraryId={defaultLibraryId}
      items={items}
      initialListScale={listScale}
      search={search}
      tag={tag}
      subfolders={[]}
      subfolderBasePath="/smartfolder"
      sortState={{
        kind: "smart-folder",
        smartFolderId,
        value: {
          orderBy: folder.orderBy,
          sortIncrease: folder.sortIncrease,
        },
      }}
    />
  );
}
