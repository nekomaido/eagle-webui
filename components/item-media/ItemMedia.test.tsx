import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ItemPreview } from "@/data/types";
import { ItemGridMedia } from "./ItemGridMedia";
import { ItemSlideMedia } from "./ItemSlideMedia";
import { MobileItemSlideMedia } from "./MobileItemSlideMedia";

vi.mock("media-chrome/react", () => ({
  MediaControlBar: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  MediaController: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  MediaFullscreenButton: () => <button type="button">fullscreen</button>,
  MediaPlayButton: () => <button type="button">play</button>,
  MediaTimeDisplay: () => <span>time</span>,
  MediaTimeRange: () => <input type="range" />,
}));

const slideClasses = {
  urlContent: "urlContent",
  urlImage: "urlImage",
  urlMeta: "urlMeta",
  urlText: "urlText",
  video: "video",
  videoContent: "videoContent",
  videoFitbox: "videoFitbox",
};

const mobileClasses = {
  urlContent: "urlContent",
  urlImage: "urlImage",
  urlMeta: "urlMeta",
  urlText: "urlText",
};

afterEach(() => {
  cleanup();
});

describe("unsupported media rendering", () => {
  it("renders an icon fallback in the grid for unsupported items", () => {
    render(
      <ItemGridMedia
        item={createItem({ ext: "psd" })}
        libraryPath="/library"
        imageClassName="image"
        onSelect={() => undefined}
      />,
    );

    expect(screen.getByTestId("unsupported-media-fallback")).not.toBeNull();
    expect(screen.queryByRole("img")).toBeNull();
  });

  it("renders an icon fallback in the desktop viewer for unsupported items", () => {
    render(
      <ItemSlideMedia
        item={createItem({ ext: "psd" })}
        libraryPath="/library"
        classes={slideClasses}
      />,
    );

    expect(screen.getByTestId("unsupported-media-fallback")).not.toBeNull();
    expect(document.querySelector("img")).toBeNull();
  });

  it("renders an icon fallback in the mobile viewer for unsupported items", () => {
    render(
      <MobileItemSlideMedia
        item={createItem({ ext: "psd" })}
        libraryPath="/library"
        classes={mobileClasses}
      />,
    );

    expect(screen.getByTestId("unsupported-media-fallback")).not.toBeNull();
    expect(document.querySelector("img")).toBeNull();
  });

  it("keeps image items on image rendering paths", () => {
    render(
      <ItemSlideMedia
        item={createItem({ ext: "png" })}
        libraryPath="/library"
        classes={slideClasses}
      />,
    );

    expect(document.querySelector("img")).not.toBeNull();
    expect(screen.queryByTestId("unsupported-media-fallback")).toBeNull();
  });
});

function createItem(overrides: Partial<ItemPreview>): ItemPreview {
  return {
    id: overrides.id ?? "item-id",
    duration: overrides.duration ?? 0,
    width: overrides.width ?? 100,
    height: overrides.height ?? 100,
    ext: overrides.ext ?? "png",
  };
}
