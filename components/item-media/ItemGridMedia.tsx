"use client";

import type { ItemPreview } from "@/data/types";
import {
  classifyItemMedia,
  getExtensionLabel,
  getThumbnailUrl,
} from "@/utils/item";
import { UnsupportedMediaFallback } from "./UnsupportedMediaFallback";

interface ItemGridMediaProps {
  item: ItemPreview;
  libraryPath: string;
  imageClassName: string;
  onSelect: (itemId: string) => void;
}

export function ItemGridMedia({
  item,
  libraryPath,
  imageClassName,
  onSelect,
}: ItemGridMediaProps) {
  switch (classifyItemMedia(item)) {
    case "image":
      return (
        <GridImageMedia
          item={item}
          libraryPath={libraryPath}
          imageClassName={imageClassName}
          onSelect={onSelect}
        />
      );
    case "thumbnailOnly":
      return (
        <GridThumbnailOnlyMedia
          item={item}
          libraryPath={libraryPath}
          imageClassName={imageClassName}
          onSelect={onSelect}
        />
      );
    case "url":
      return (
        <GridUrlMedia
          item={item}
          libraryPath={libraryPath}
          imageClassName={imageClassName}
          onSelect={onSelect}
        />
      );
    case "video":
      return (
        <GridVideoMedia
          item={item}
          libraryPath={libraryPath}
          imageClassName={imageClassName}
          onSelect={onSelect}
        />
      );
    case "unsupported":
      return <GridUnsupportedMedia item={item} onSelect={onSelect} />;
  }
}

type GridThumbnailMediaProps = {
  item: ItemPreview;
  libraryPath: string;
  imageClassName: string;
  onSelect: (itemId: string) => void;
};

function GridImageMedia(props: GridThumbnailMediaProps) {
  return <GridThumbnailMedia {...props} />;
}

function GridThumbnailOnlyMedia(props: GridThumbnailMediaProps) {
  return <GridThumbnailMedia {...props} />;
}

function GridUrlMedia(props: GridThumbnailMediaProps) {
  return <GridThumbnailMedia {...props} />;
}

function GridVideoMedia(props: GridThumbnailMediaProps) {
  return <GridThumbnailMedia {...props} />;
}

function GridThumbnailMedia({
  item,
  libraryPath,
  imageClassName,
  onSelect,
}: GridThumbnailMediaProps) {
  return (
    <>
      {/** biome-ignore lint/a11y/useKeyWithClickEvents: image grid */}
      {/** biome-ignore lint/performance/noImgElement: image grid */}
      <img
        className={imageClassName}
        src={getThumbnailUrl(item.id, libraryPath)}
        alt={item.id}
        onClick={() => onSelect(item.id)}
        loading="lazy"
        decoding="async"
      />
    </>
  );
}

function GridUnsupportedMedia({
  item,
  onSelect,
}: Pick<GridThumbnailMediaProps, "item" | "onSelect">) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(item.id)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect(item.id);
        }
      }}
      aria-label={`Open ${getExtensionLabel(item.ext)} item`}
    >
      <UnsupportedMediaFallback ext={item.ext} variant="grid" />
    </div>
  );
}
