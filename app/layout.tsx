import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "./globals.css";

import {
  Center,
  ColorSchemeScript,
  Loader,
  mantineHtmlProps,
  Stack,
  Text,
} from "@mantine/core";
import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getTranslations } from "next-intl/server";
import { AppLayout } from "@/components/AppLayout";
import { AppMantineProvider } from "@/components/AppMantineProvider";
import { ImportErrorScreen } from "@/components/ImportErrorScreen";
import { ImportLoader } from "@/components/ImportLoader";
import {
  getDefaultLibraryId,
  getLibraryDefinitions,
} from "@/data/library-config";
import { loadNavbarExpandedState } from "@/data/settings";
import {
  getStore,
  getStoreImportState,
  type StoreInitializationState,
} from "@/data/store";
import { getLibraryName } from "@/utils/get-library-name";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Eagle WebUI",
  description: "A web interface for the Eagle image viewer application",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  void getStore().catch(() => undefined);
  const defaultLibraryId = await getDefaultLibraryId();
  const importState = getStoreImportState();
  const locale = await getLocale();
  const t = await getTranslations();
  const loadingLabel = t("import.loading");

  return (
    <html lang={locale} {...mantineHtmlProps} className={cn("font-sans", geist.variable)}>
      <head>
        <ColorSchemeScript />
      </head>
      <body>
        <NextIntlClientProvider>
          <AppMantineProvider>
            <ImportStateContent
              state={importState}
              loadingLabel={loadingLabel}
              defaultLibraryId={defaultLibraryId}
            >
              {children}
            </ImportStateContent>
          </AppMantineProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

function ImportStateContent({
  state,
  loadingLabel,
  defaultLibraryId,
  children,
}: {
  state: StoreInitializationState;
  loadingLabel: string;
  defaultLibraryId: string;
  children: React.ReactNode;
}) {
  switch (state.status) {
    case "idle":
    case "loading":
      return <ImportLoadingScreen label={loadingLabel} />;
    case "error":
      return <ImportErrorScreen code={state.code} />;
    case "ready":
      return (
        <ImportReadyLayout defaultLibraryId={defaultLibraryId}>
          {children}
        </ImportReadyLayout>
      );
    default:
      return null;
  }
}

function ImportLoadingScreen({ label }: { label: string }) {
  return (
    <>
      <ImportLoader />
      <Center h="100vh">
        <Stack gap="sm" align="center">
          <Loader size="lg" color="gray" />
          <Text>{label}</Text>
        </Stack>
      </Center>
    </>
  );
}

async function ImportReadyLayout({
  defaultLibraryId,
  children,
}: {
  defaultLibraryId: string;
  children: React.ReactNode;
}) {
  const store = await getStore(defaultLibraryId);
  const [navbarExpandedState, libraries] = await Promise.all([
    loadNavbarExpandedState(),
    getLibraryDefinitions(),
  ]);
  const libraryName = getLibraryName(store.libraryPath);

  return (
    <AppLayout
      folders={store.getFolders()}
      itemCounts={store.itemCounts}
      libraryName={libraryName}
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
