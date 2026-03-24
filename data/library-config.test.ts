/**
 * @vitest-environment node
 */
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LibraryImportError } from "./errors";
import {
  generateLibraryId,
  getDefaultLibraryId,
  getLibraryDefinitions,
  getLibraryPath,
  loadLibraryConfig,
  resetLibraryConfig,
} from "./library-config";

const originalCwd = process.cwd();

afterEach(() => {
  vi.restoreAllMocks();
  process.chdir(originalCwd);
  resetLibraryConfig();
});

describe("library-config", () => {
  it("discovers valid Eagle libraries from ./eagle", async () => {
    const cwd = await createWorkspace();
    await createLibrary(cwd, "Personal.library");
    await createLibrary(cwd, "Work.library");
    await fs.mkdir(path.join(cwd, "eagle", "notes"), { recursive: true });

    process.chdir(cwd);

    const config = await loadLibraryConfig();

    expect(config.libraries.map((library) => library.id)).toEqual([
      generateLibraryId(path.join(cwd, "eagle", "Personal.library")),
      generateLibraryId(path.join(cwd, "eagle", "Work.library")),
    ]);
    expect(config.defaultLibraryId).toBe(
      generateLibraryId(path.join(cwd, "eagle", "Personal.library")),
    );
    expect(await getDefaultLibraryId()).toBe(
      generateLibraryId(path.join(cwd, "eagle", "Personal.library")),
    );
    const expectedLibraryPath = await fs.realpath(
      path.join(cwd, "eagle", "Work.library"),
    );
    expect(
      await getLibraryPath(
        generateLibraryId(path.join(cwd, "eagle", "Work.library")),
      ),
    ).toBe(expectedLibraryPath);
  });

  it("throws when ./eagle is missing", async () => {
    const cwd = await createWorkspace();
    process.chdir(cwd);

    await expect(loadLibraryConfig()).rejects.toBeInstanceOf(
      LibraryImportError,
    );
    await expect(loadLibraryConfig()).rejects.toMatchObject({
      code: "LIBRARY_PATH_NOT_FOUND",
    });
  });

  it("throws when ./eagle has no valid libraries", async () => {
    const cwd = await createWorkspace();
    await fs.mkdir(path.join(cwd, "eagle", "not-a-library"), {
      recursive: true,
    });

    process.chdir(cwd);

    await expect(getLibraryDefinitions()).rejects.toMatchObject({
      code: "LIBRARY_PATH_NOT_FOUND",
    });
  });

  it("throws when looking up an unknown library id", async () => {
    const cwd = await createWorkspace();
    await createLibrary(cwd, "Archive.library");

    process.chdir(cwd);

    await loadLibraryConfig();

    await expect(getLibraryPath("missing")).rejects.toMatchObject({
      code: "LIBRARY_NOT_FOUND",
    });
  });

  it("creates stable ids from library names", () => {
    expect(generateLibraryId("/tmp/eagle/My Library.library")).toMatch(
      /^my-library-[a-f0-9]{8}$/,
    );
  });

  it("prefers /eagle when it exists", async () => {
    const accessMock = vi.spyOn(fs, "access");
    const readdirMock = vi.spyOn(fs, "readdir");

    accessMock.mockImplementation(async (targetPath) => {
      const value = String(targetPath);
      if (
        value === "/eagle" ||
        value === "/eagle/Docker.library/metadata.json"
      ) {
        return undefined;
      }

      throw new Error("missing");
    });

    readdirMock.mockImplementation(async (targetPath) => {
      if (String(targetPath) === "/eagle") {
        return [
          {
            name: "Docker.library",
            isDirectory: () => true,
          },
        ] as never;
      }

      return [] as never;
    });

    const config = await loadLibraryConfig();

    expect(config.libraries).toEqual([
      {
        id: generateLibraryId("/eagle/Docker.library"),
        path: "/eagle/Docker.library",
        name: "Docker.library",
      },
    ]);
  });

  it("creates unique ids for library names that sanitize to an empty slug", async () => {
    const cwd = await createWorkspace();
    await createLibrary(cwd, "！！！.library");
    await createLibrary(cwd, "？？？.library");

    process.chdir(cwd);

    const config = await getLibraryDefinitions();
    const ids = config.map((library) => library.id);

    expect(ids).toHaveLength(2);
    expect(new Set(ids).size).toBe(2);
    expect(ids.every((id) => /^[a-f0-9]{8}$/.test(id))).toBe(true);
  });
});

async function createWorkspace(): Promise<string> {
  return fs.mkdtemp(path.join(os.tmpdir(), "eagle-webui-library-config-"));
}

async function createLibrary(cwd: string, folderName: string): Promise<void> {
  const libraryDir = path.join(cwd, "eagle", folderName);
  await fs.mkdir(libraryDir, { recursive: true });
  await fs.writeFile(path.join(libraryDir, "metadata.json"), "{}", "utf8");
}
