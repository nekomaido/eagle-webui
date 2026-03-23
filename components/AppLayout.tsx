"use client";

import {
  AppShell,
  Burger,
  CloseButton,
  Group,
  ScrollArea,
  Table,
  Text,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconLayoutSidebarRightCollapse } from "@tabler/icons-react";
import type { ReactNode } from "react";
import type { LibraryDefinition } from "@/data/library-config";
import type { NavbarExpandedState } from "@/data/settings";
import type { SmartFolder } from "@/data/smart-folders";
import type { Folder, ItemCounts } from "@/data/types";
import { useTranslations } from "@/i18n/client";
import { useInspectorState } from "@/stores/inspector-state";
import { formatFileSize } from "@/utils/item-details";
import { HeaderSlotProvider, useHeaderSlot } from "./AppHeader";
import classes from "./AppLayout.module.css";
import { AppNavbar } from "./AppNabbar/AppNavbar";
import { FolderInspector } from "./FolderInspector";
import { ItemInspector } from "./ItemInspector";

type AppLayoutProps = {
  children: ReactNode;
  folders: Folder[];
  libraries: LibraryDefinition[];
  defaultLibraryId: string;
  currentLibraryId: string;
  itemCounts: ItemCounts;
  smartFolders: SmartFolder[];
  initialNavbarExpandedState: NavbarExpandedState;
};

function HeaderOutlet() {
  const { header } = useHeaderSlot();
  return <>{header}</>;
}

function CollectionInspector({
  type,
  itemCount,
  totalSize,
}: {
  type: "all" | "uncategorized" | "trash";
  itemCount: number;
  totalSize: number;
}) {
  const t = useTranslations("inspector");
  const tCollection = useTranslations("collection");
  const sizeValue = formatFileSize(totalSize);

  const titles = {
    all: tCollection("all"),
    uncategorized: tCollection("uncategorized"),
    trash: tCollection("trash"),
  };

  return (
    <div style={{ padding: "16px" }}>
      <div style={{ marginBottom: "16px" }}>
        <Text style={{ wordBreak: "break-all", fontSize: "1.1rem" }}>
          {titles[type]}
        </Text>
      </div>

      <Table
        verticalSpacing="sm"
        horizontalSpacing="xs"
        style={{ width: "100%" }}
      >
        <tbody>
          <tr>
            <td style={{ padding: "4px 0" }}>
              <Text size="sm" c="dimmed">
                {t("folderProperties.items")}
              </Text>
            </td>
            <td style={{ padding: "4px 0", textAlign: "right" }}>
              {itemCount}
            </td>
          </tr>
          {sizeValue && (
            <tr>
              <td style={{ padding: "4px 0" }}>
                <Text size="sm" c="dimmed">
                  {t("folderProperties.size")}
                </Text>
              </td>
              <td style={{ padding: "4px 0", textAlign: "right" }}>
                {sizeValue}
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  );
}

export function AppLayout({
  children,
  folders,
  libraries,
  defaultLibraryId,
  currentLibraryId,
  itemCounts,
  smartFolders,
  initialNavbarExpandedState,
}: AppLayoutProps) {
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);

  const { context: inspectorContext } = useInspectorState();

  const isSliderPresented = inspectorContext.kind === "item";

  return (
    <AppShell
      layout="alt"
      header={{ height: 50 }}
      navbar={{
        width: 240,
        breakpoint: "sm",
        collapsed: { mobile: !mobileOpened, desktop: !desktopOpened },
      }}
      aside={{
        width: 260,
        breakpoint: "sm",
        collapsed: {
          mobile: false,
          desktop: false,
        },
      }}
      padding="md"
    >
      <HeaderSlotProvider>
        <AppShell.Header>
          <Group h="100%" px="md" wrap="nowrap">
            <Burger
              opened={mobileOpened}
              onClick={toggleMobile}
              hiddenFrom="sm"
              lineSize={1}
            />

            {!desktopOpened && (
              <CloseButton
                icon={<IconLayoutSidebarRightCollapse stroke={1} />}
                visibleFrom="sm"
                onClick={toggleDesktop}
              />
            )}

            <HeaderOutlet />
          </Group>
        </AppShell.Header>

        <AppNavbar
          mobileOpened={mobileOpened}
          toggleMobile={toggleMobile}
          desktopOpened={desktopOpened}
          toggleDesktop={toggleDesktop}
          folders={folders}
          itemCounts={itemCounts}
          libraries={libraries}
          defaultLibraryId={defaultLibraryId}
          currentLibraryId={currentLibraryId}
          smartFolders={smartFolders}
          initialNavbarExpandedState={initialNavbarExpandedState}
        />

        <AppShell.Main
          className={classes.main}
          data-with-slider={isSliderPresented}
        >
          {children}
        </AppShell.Main>

        <AppShell.Aside className={classes.aside}>
          <AppShell.Section
            grow
            component={ScrollArea}
            className={classes.asideScrollabel}
          >
            {inspectorContext.kind === "item" && (
              <ItemInspector
                itemId={inspectorContext.itemId}
                libraryId={currentLibraryId}
                defaultLibraryId={defaultLibraryId}
              />
            )}
            {inspectorContext.kind === "folder" && (
              <FolderInspector
                folder={
                  inspectorContext.folder as Folder & {
                    itemCount: number;
                  }
                }
                totalSize={inspectorContext.totalSize}
              />
            )}
            {inspectorContext.kind === "collection" && (
              <CollectionInspector
                type={inspectorContext.type}
                itemCount={inspectorContext.itemCount}
                totalSize={inspectorContext.totalSize}
              />
            )}
            {inspectorContext.kind === "none" && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                  color: "var(--mantine-color-dimmed)",
                  fontSize: "var(--mantine-font-size-sm)",
                }}
              >
                Select a folder or item to view details
              </div>
            )}
          </AppShell.Section>
        </AppShell.Aside>
      </HeaderSlotProvider>
    </AppShell>
  );
}
