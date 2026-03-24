"use client";

import { Anchor, Text } from "@mantine/core";
import { IconExternalLink } from "@tabler/icons-react";
import {
  MediaControlBar,
  MediaController,
  MediaFullscreenButton,
  MediaPlayButton,
  MediaTimeDisplay,
  MediaTimeRange,
} from "media-chrome/react";
import type { CSSProperties, ReactNode } from "react";
import { useEffect, useState } from "react";
import type { ItemDetails, ItemPreview } from "@/data/types";
import {
  classifyItemMedia,
  getImageUrl,
  getThumbnailUrl,
} from "@/utils/item";
import { UnsupportedMediaFallback } from "./UnsupportedMediaFallback";

interface MobileItemSlideMediaProps {
  item: ItemPreview;
  libraryPath: string;
  classes: {
    urlContent: string;
    urlImage: string;
    urlMeta: string;
    urlText: string;
  };
}

export function MobileItemSlideMedia({
  item,
  libraryPath,
  classes,
}: MobileItemSlideMediaProps) {
  switch (classifyItemMedia(item)) {
    case "image":
      return <MobileImageContent item={item} libraryPath={libraryPath} />;
    case "thumbnailOnly":
      return <MobileThumbnailContent item={item} libraryPath={libraryPath} />;
    case "url":
      return (
        <MobileUrlContent item={item} libraryPath={libraryPath} classes={classes} />
      );
    case "video":
      return <MobileVideoContent item={item} libraryPath={libraryPath} />;
    case "unsupported":
      return <MobileUnsupportedContent item={item} />;
  }
}

type MobileContentProps = {
  item: ItemPreview;
  libraryPath: string;
};

function MobileThumbnailContent({ item, libraryPath }: MobileContentProps) {
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

function MobileImageContent({ item, libraryPath }: MobileContentProps) {
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

function MobileUnsupportedContent({
  item,
}: Pick<MobileContentProps, "item">) {
  return <UnsupportedMediaFallback ext={item.ext} variant="viewer" />;
}

function MobileVideoContent({ item, libraryPath }: MobileContentProps) {
  const controlBarStyle = {
    "--media-tooltip-display": "none",
    margin: "5px 15px",
  } as CSSProperties;

  return (
    <MediaController style={{ width: "100%", height: "100%" }}>
      {/** biome-ignore lint/a11y/useMediaCaption: simple video */}
      <video
        slot="media"
        src={getImageUrl(item.id, libraryPath)}
        poster={getThumbnailUrl(item.id, libraryPath)}
        playsInline
        loop
        style={{
          objectFit: "contain",
          backgroundColor: "white",
        }}
      />
      <MediaControlBar style={controlBarStyle}>
        <div className="no-swiping" style={{ display: "flex", flexGrow: 1 }}>
          <MediaPlayButton style={{ borderRadius: "15px 0 0 15px" }} />
          <MediaTimeRange style={{ width: "100%" }} />
          <MediaTimeDisplay showDuration />
          <MediaFullscreenButton style={{ borderRadius: "0 15px 15px 0" }} />
        </div>
      </MediaControlBar>
    </MediaController>
  );
}

type MobileUrlContentProps = MobileContentProps & {
  classes: MobileItemSlideMediaProps["classes"];
};

function MobileUrlContent({
  item,
  libraryPath,
  classes,
}: MobileUrlContentProps) {
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
        console.error(
          `[MobileUrlContent] Failed to load item ${item.id}:`,
          error,
        );
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
        className={`${classes.urlText} no-ui-toggle`}
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
      <a
        className={`${classes.urlImage} no-ui-toggle`}
        target={target}
        href={itemUrl}
        rel={rel}
      >
        {/** biome-ignore lint/performance/noImgElement: url thumbnail */}
        <img src={getThumbnailUrl(item.id, libraryPath)} alt="thumbnail" />
      </a>
      <div className={classes.urlMeta}>{metaContent}</div>
    </div>
  );
}
