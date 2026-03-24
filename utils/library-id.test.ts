import { describe, expect, it } from "vitest";
import { createLibraryId } from "./library-id";

describe("createLibraryId", () => {
  it("keeps ascii names readable with a stable hash suffix", () => {
    expect(createLibraryId("/tmp/eagle/My Library.library")).toMatch(
      /^my-library-[a-f0-9]{8}$/,
    );
  });

  it("returns the same id for the same library path", () => {
    const first = createLibraryId("/tmp/eagle/測試.library");
    const second = createLibraryId("/tmp/eagle/測試.library");

    expect(first).toBe(second);
  });

  it("produces different ids for different non-ascii names", () => {
    const first = createLibraryId("/tmp/eagle/測試.library");
    const second = createLibraryId("/tmp/eagle/テスト.library");

    expect(first).not.toBe(second);
  });

  it("uses a safe fallback prefix when the slug would be empty", () => {
    expect(createLibraryId("/tmp/eagle/！！！.library")).toMatch(/^[a-f0-9]{8}$/);
  });
});
