import { promises as fs } from "node:fs";
import path from "node:path";
import { LibraryImportError } from "./errors/index";
import { createLibraryId } from "@/utils/library-id";

export interface LibraryDefinition {
  id: string;
  path: string;
  name?: string;
}

export interface LibraryConfig {
  libraries: LibraryDefinition[];
  defaultLibraryId: string;
}

let cachedConfig: LibraryConfig | null = null;

export function resetLibraryConfig(): void {
  cachedConfig = null;
}

export async function loadLibraryConfig(): Promise<LibraryConfig> {
  if (cachedConfig) {
    return cachedConfig;
  }

  const config = await detectLibraryConfig();
  cachedConfig = config;
  return config;
}

async function detectLibraryConfig(): Promise<LibraryConfig> {
  const discoveredLibraries = await scanDefaultLibrariesDir();
  if (discoveredLibraries.length === 0) {
    throw new LibraryImportError("LIBRARY_PATH_NOT_FOUND");
  }

  return {
    libraries: discoveredLibraries,
    defaultLibraryId: discoveredLibraries[0].id,
  };
}

export function generateLibraryId(libraryPath: string): string {
  return createLibraryId(libraryPath);
}

async function scanDefaultLibrariesDir(): Promise<LibraryDefinition[]> {
  const candidateDirs = ["/eagle", path.join(process.cwd(), "eagle")];

  for (const candidateDir of candidateDirs) {
    const libraries = await scanLibraryDir(candidateDir);
    if (libraries.length > 0) {
      return libraries;
    }
  }

  return [];
}

async function scanLibraryDir(dirPath: string): Promise<LibraryDefinition[]> {
  try {
    await fs.access(dirPath, fs.constants.R_OK);

    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    const libraries: LibraryDefinition[] = [];

    for (const entry of entries) {
      if (!entry.isDirectory()) {
        continue;
      }

      const libPath = path.join(dirPath, entry.name);
      const metadataPath = path.join(libPath, "metadata.json");

      try {
        await fs.access(metadataPath);
        libraries.push({
          id: generateLibraryId(libPath),
          path: libPath,
          name: entry.name,
        });
      } catch {
        // Not a valid library, skip
      }
    }

    return libraries;
  } catch {
    return [];
  }
}

export async function getLibraryDefinitions(): Promise<LibraryDefinition[]> {
  const config = await loadLibraryConfig();
  return config.libraries;
}

export async function getDefaultLibraryId(): Promise<string> {
  const config = await loadLibraryConfig();
  return config.defaultLibraryId;
}

export async function getLibraryPath(libraryId: string): Promise<string> {
  const config = await loadLibraryConfig();
  const library = config.libraries.find((lib) => lib.id === libraryId);

  if (!library) {
    throw new LibraryImportError("LIBRARY_NOT_FOUND", {
      cause: new Error(`Library not found: ${libraryId}`),
    });
  }

  return library.path;
}

export async function getLibraryDefinition(
  libraryId: string,
): Promise<LibraryDefinition | undefined> {
  const config = await loadLibraryConfig();
  return config.libraries.find((lib) => lib.id === libraryId);
}
