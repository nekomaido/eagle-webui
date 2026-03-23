import { getTranslations } from "next-intl/server";
import CollectionPage from "@/components/CollectionPage";
import { getDefaultLibraryId } from "@/data/library-config";
import { loadListScaleSetting } from "@/data/settings";
import { getStore } from "@/data/store";
import { resolveSearchQuery, resolveTagFilter } from "@/utils/search-query";

export const dynamic = "force-dynamic";

type TrashPageProps = {
  params: Promise<Record<string, string>>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function TrashPage({
  params,
  searchParams,
}: TrashPageProps) {
  const { libraryId } = await params;
  const resolvedSearchParams = await searchParams;
  const defaultLibraryId = await getDefaultLibraryId();

  const [t, store, listScale] = await Promise.all([
    getTranslations(),
    getStore(libraryId),
    loadListScaleSetting(),
  ]);

  const search = resolveSearchQuery(resolvedSearchParams?.search);
  const tag = resolveTagFilter(resolvedSearchParams?.tag);
  const items = store.getTrashItemPreviews(search, tag);

  return (
    <CollectionPage
      title={t("collection.trash")}
      libraryPath={store.libraryPath}
      libraryId={libraryId}
      defaultLibraryId={defaultLibraryId}
      items={items}
      initialListScale={listScale}
      search={search}
      tag={tag}
      subfolders={[]}
      collectionType="trash"
      sortState={{
        kind: "global",
        value: store.globalSortSettings,
      }}
    />
  );
}
