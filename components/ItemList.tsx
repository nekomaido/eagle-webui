"use client";

import { Center, Text } from "@mantine/core";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { type GridStateSnapshot, VirtuosoGrid } from "react-virtuoso";
import type { ItemPreview } from "@/data/types";
import { useTranslations } from "@/i18n/client";
import { classifyItemMedia, getExtensionLabel } from "@/utils/item";
import { ItemGridMedia } from "./item-media/ItemGridMedia";
import classes from "./ItemList.module.css";
import { computeGridStyle } from "./listGrid";

export interface ItemSelection {
  itemId: string;
  stateSnapshot: GridStateSnapshot | null;
}

interface ItemListProps {
  libraryPath: string;
  items: ItemPreview[];
  initialState?: GridStateSnapshot | null;
  onSelectItem: (selection: ItemSelection) => void;
  listScale: number;
}

export function ItemList({
  libraryPath,
  items,
  initialState,
  onSelectItem,
  listScale,
}: ItemListProps) {
  const t = useTranslations();
  const latestStateRef = useRef<GridStateSnapshot | null>(initialState ?? null);
  const listStyle = useMemo(() => computeGridStyle(listScale), [listScale]);

  useEffect(() => {
    latestStateRef.current = initialState ?? null;
  }, [initialState]);

  const handleStateChanged = useCallback((snapshot: GridStateSnapshot) => {
    latestStateRef.current = snapshot;
  }, []);

  const emitSelection = useCallback(
    (itemId: string, snapshot: GridStateSnapshot | null) => {
      onSelectItem({
        itemId,
        stateSnapshot: snapshot,
      });
    },
    [onSelectItem],
  );

  const handleSelect = useCallback(
    (itemId: string) => {
      emitSelection(itemId, latestStateRef.current);
    },
    [emitSelection],
  );

  const itemContent = (index: number) => {
    const item = items[index];
    if (!item) {
      return null;
    }
    const extensionLabel = getExtensionLabel(item.ext);
    const mediaKind = classifyItemMedia(item);
    const showBadge = mediaKind === "video" || extensionLabel === "URL";
    return (
      <>
        <ItemGridMedia
          item={item}
          libraryPath={libraryPath}
          imageClassName={classes.image}
          onSelect={handleSelect}
        />
        {showBadge ? (
          <div className={classes.typeBadge}>{extensionLabel}</div>
        ) : null}
      </>
    );
  };

  if (items.length === 0) {
    return (
      <Center mih={240}>
        <Text c="dimmed">{t("common.status.noItems")}</Text>
      </Center>
    );
  }

  return (
    <VirtuosoGrid
      useWindowScroll
      style={listStyle}
      listClassName={classes.list}
      itemClassName={classes.item}
      totalCount={items.length}
      itemContent={itemContent}
      restoreStateFrom={initialState ?? undefined}
      stateChanged={handleStateChanged}
      increaseViewportBy={200}
    />
  );
}
