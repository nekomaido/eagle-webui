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
import { Geist } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getTranslations } from "next-intl/server";
import { AppMantineProvider } from "@/components/AppMantineProvider";
import { ImportErrorScreen } from "@/components/ImportErrorScreen";
import { ImportLoader } from "@/components/ImportLoader";
import { getDefaultLibraryId } from "@/data/library-config";
import {
  getStore,
  getStoreImportState,
  type StoreInitializationState,
} from "@/data/store";
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

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
    <html
      lang={locale}
      {...mantineHtmlProps}
      className={cn("font-sans", geist.variable)}
    >
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
      return <>{children}</>;
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
