import { describe, expect, it } from "vitest";
import type { ItemPreview } from "@/data/types";
import { classifyItemMedia } from "./item";

function createItem(overrides: Partial<ItemPreview>): ItemPreview {
  return {
    id: overrides.id ?? "item-id",
    duration: overrides.duration ?? 0,
    width: overrides.width ?? 100,
    height: overrides.height ?? 100,
    ext: overrides.ext ?? "png",
  };
}

describe("item media helpers", () => {
  it("classifies URL items", () => {
    expect(classifyItemMedia(createItem({ ext: "url" }))).toBe("url");
  });

  it("classifies video items by duration", () => {
    expect(classifyItemMedia(createItem({ duration: 12 }))).toBe("video");
  });

  it("classifies supported image extensions", () => {
    expect(classifyItemMedia(createItem({ ext: "png" }))).toBe("image");
    expect(classifyItemMedia(createItem({ ext: "webp" }))).toBe("image");
  });

  it("marks json-backed Eagle assets as thumbnail-only", () => {
    expect(classifyItemMedia(createItem({ ext: "json" }))).toBe(
      "thumbnailOnly",
    );
  });

  it("marks unknown extensions as unsupported", () => {
    expect(classifyItemMedia(createItem({ ext: "psd" }))).toBe("unsupported");
  });
});
