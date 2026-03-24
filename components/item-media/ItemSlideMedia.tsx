"use client";

import { Anchor, Text } from "@mantine/core";
import { IconExternalLink } from "@tabler/icons-react";
import type { CSSProperties, ReactNode } from "react";
import { useEffect, useState } from "react";
import type { ItemDetails, ItemPreview } from "@/data/types";
import {
  classifyItemMedia,
  getImageUrl,
  getThumbnailUrl,
} from "@/utils/item";
import { UnsupportedMediaFallback } from "./UnsupportedMediaFallback";

interface ItemSlideMediaProps {
  item: ItemPreview;
  libraryPath: string;
  classes: {
    urlContent: string;
    urlImage: string;
    urlMeta: string;
    urlText: string;
    video: string;
    videoContent: string;
    videoFitbox: string;
  };
}

export function ItemSlideMedia({
  item,
  libraryPath,
  classes,
}: ItemSlideMediaProps) {
  switch (classifyItemMedia(item)) {
    case "image":
      return <ImageContent item={item} libraryPath={libraryPath} />;
    case "thumbnailOnly":
      return <ThumbnailContent item={item} libraryPath={libraryPath} />;
    case "url":
      return <UrlContent item={item} libraryPath={libraryPath} classes={classes} />;
    case "video":
      return <VideoContent item={item} libraryPath={libraryPath} {...classes} />;
    case "unsupported":
      return <UnsupportedContent item={item} />;
  }
}

type SharedContentProps = {
  item: ItemPreview;
  libraryPath: string;
};

function ThumbnailContent({ item, libraryPath }: SharedContentProps) {
  return (
    <div className="swiper-zoom-container">
      {/** biome-ignore lint/performance/noImgElement: use swiper */}
      <img
        src={getThumbnailUrl(item.id, libraryPath)}
        alt={item.id}
        loading="lazy"
        decoding="async"
      />
    </div>
  );
}

function ImageContent({ item, libraryPath }: SharedContentProps) {
  return (
    <div className="swiper-zoom-container">
      {/** biome-ignore lint/performance/noImgElement: use swiper */}
      <img
        src={getImageUrl(item.id, libraryPath)}
        alt={item.id}
        loading="lazy"
        decoding="async"
      />
    </div>
  );
}

function UnsupportedContent({ item }: Pick<SharedContentProps, "item">) {
  return <UnsupportedMediaFallback ext={item.ext} variant="viewer" />;
}

type VideoContentProps = SharedContentProps & ItemSlideMediaProps["classes"];

function VideoContent({
  item,
  libraryPath,
  videoContent,
  videoFitbox,
  video,
}: VideoContentProps) {
  return (
    <div className={videoContent}>
      <div
        className={videoFitbox}
        style={
          {
            "--ratio": `(${item.width}/${item.height})`,
          } as CSSProperties
        }
      >
        {/** biome-ignore lint/a11y/useMediaCaption: simple video */}
        <video
          className={video}
          src={getImageUrl(item.id, libraryPath)}
          poster={getThumbnailUrl(item.id, libraryPath)}
          playsInline
          loop
          controls
        />
      </div>
    </div>
  );
}

type UrlContentProps = SharedContentProps & {
  classes: Pick<
    ItemSlideMediaProps["classes"],
    "urlContent" | "urlImage" | "urlMeta" | "urlText"
  >;
};

function UrlContent({ item, libraryPath, classes }: UrlContentProps) {
  const [metadata, setMetadata] = useState<Pick<
    ItemDetails,
    "name" | "url"
  > | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setMetadata(null);

    async function load() {
      try {
        const response = await fetch(`/api/items/${item.id}`, {
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }
        const data = (await response.json()) as ItemDetails;
        if (controller.signal.aborted) return;
        setMetadata({
          name: data.name,
          url: data.url,
        });
      } catch (error) {
        if (controller.signal.aborted) return;
        console.error(`[URLContent] Failed to load item ${item.id}:`, error);
      }
    }

    load();

    return () => {
      controller.abort();
    };
  }, [item.id]);

  const itemUrl =
    metadata?.url && metadata.url.length > 0 ? metadata.url : undefined;
  const hasUrl = Boolean(itemUrl);
  const target = hasUrl ? "_blank" : undefined;
  const rel = hasUrl ? "noopener" : undefined;

  let metaContent: ReactNode = null;

  if (metadata) {
    const itemName = metadata.name || metadata.url || "Untitled item";
    metaContent = hasUrl ? (
      <Anchor
        className={classes.urlText}
        target={target}
        href={itemUrl}
        rel={rel}
      >
        {itemName}
        <IconExternalLink size={18} stroke={1} />
      </Anchor>
    ) : (
      <Text className={classes.urlText} component="span">
        {itemName}
      </Text>
    );
  }

  return (
    <div className={classes.urlContent}>
      <a className={classes.urlImage} target={target} href={itemUrl} rel={rel}>
        {/** biome-ignore lint/performance/noImgElement: url thumbnail */}
        <img src={getThumbnailUrl(item.id, libraryPath)} alt="thumbnail" />
      </a>
      <div className={classes.urlMeta}>{metaContent}</div>
    </div>
  );
}
