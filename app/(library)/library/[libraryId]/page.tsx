import { getTranslations } from "next-intl/server";
import CollectionPage from "@/components/CollectionPage";
import { getDefaultLibraryId } from "@/data/library-config";
import { loadListScaleSetting } from "@/data/settings";
import { getStore } from "@/data/store";
import { resolveSearchQuery, resolveTagFilter } from "@/utils/search-query";

export const dynamic = "force-dynamic";

type LibraryHomePageProps = {
  params: Promise<Record<string, string>>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function LibraryHomePage({
  params,
  searchParams,
}: LibraryHomePageProps) {
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
  const items = store.getItemPreviews(search, tag);

  return (
    <CollectionPage
      title={t("collection.all")}
      libraryPath={store.libraryPath}
      libraryId={libraryId}
      defaultLibraryId={defaultLibraryId}
      items={items}
      initialListScale={listScale}
      search={search}
      tag={tag}
      subfolders={[]}
      sortState={{
        kind: "global",
        value: store.globalSortSettings,
      }}
    />
  );
}
