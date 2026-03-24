import { describe, expect, it } from "vitest";
import { buildLibraryUrl } from "./library-context";

describe("buildLibraryUrl", () => {
  it("always scopes default library routes under /library/:id", () => {
    expect(buildLibraryUrl("/folders/root", "default", "default")).toBe(
      "/library/default/folders/root",
    );
    expect(buildLibraryUrl("/", "default", "default")).toBe("/library/default");
  });

  it("uses the provided non-default library id", () => {
    expect(buildLibraryUrl("/trash", "work", "default")).toBe(
      "/library/work/trash",
    );
  });

  it("falls back to the default library id when the current id is missing", () => {
    expect(buildLibraryUrl("/smartfolder/abc", undefined, "default")).toBe(
      "/library/default/smartfolder/abc",
    );
  });

  it("does not duplicate an already scoped library path", () => {
    expect(
      buildLibraryUrl("/library/test/folders/root", "test", "default"),
    ).toBe("/library/test/folders/root");
  });

  it("leaves global routes outside the library scope", () => {
    expect(buildLibraryUrl("/settings", "test", "default")).toBe("/settings");
  });
});
