import { promises as fs } from "node:fs";
import path from "node:path";
import { LibraryImportError } from "./errors/index";

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
  // Priority 1: EAGLE_LIBRARY_PATH env var (can be JSON array or single path)
  const pathEnv = process.env.EAGLE_LIBRARY_PATH?.trim();
  if (pathEnv) {
    const paths = parseLibraryPaths(pathEnv);
    if (paths.length > 0) {
      return createConfigFromPaths(paths);
    }
  }

  // Priority 2: eagle-libraries.json config file
  const config = await tryLoadConfigFile();
  if (config) {
    validateLibraryConfig(config);
    return config;
  }

  // Priority 3: Try to discover from Eagle API
  const discoveredPaths = await discoverLibrariesFromAPI();
  if (discoveredPaths.length > 0) {
    return createConfigFromPaths(discoveredPaths);
  }

  throw new LibraryImportError("LIBRARY_PATH_NOT_FOUND");
}

function parseLibraryPaths(envValue: string): string[] {
  // Try parsing as JSON array first
  if (envValue.startsWith("[")) {
    try {
      const parsed = JSON.parse(envValue);
      if (Array.isArray(parsed)) {
        return parsed.filter((p): p is string => typeof p === "string" && p.trim().length > 0);
      }
    } catch {
      // Not valid JSON, fall through
    }
  }

  // Treat as single path
  return [envValue];
}

async function tryLoadConfigFile(): Promise<LibraryConfig | null> {
  const configPath = path.join(process.cwd(), "eagle-libraries.json");

  try {
    const content = await fs.readFile(configPath, "utf-8");
    const raw = JSON.parse(content);

    const libraries: LibraryDefinition[] = (raw.libraries ?? []).map(
      (lib: { id?: string; path?: string; name?: string }) => ({
        id: lib.id ?? generateLibraryId(lib.path ?? ""),
        path: lib.path ?? "",
        name: lib.name,
      }),
    );

    const defaultLibraryId =
      raw.defaultLibraryId ?? (libraries.length > 0 ? libraries[0].id : "");

    return { libraries, defaultLibraryId };
  } catch {
    return null;
  }
}

function validateLibraryConfig(config: LibraryConfig): void {
  if (!Array.isArray(config.libraries) || config.libraries.length === 0) {
    throw new Error("Config must have at least one library");
  }

  const ids = new Set<string>();
  for (const lib of config.libraries) {
    if (!lib.id || !lib.path) {
      throw new Error(`Library missing required fields: ${JSON.stringify(lib)}`);
    }
    if (ids.has(lib.id)) {
      throw new Error(`Duplicate library ID: ${lib.id}`);
    }
    ids.add(lib.id);
  }

  if (config.defaultLibraryId && !ids.has(config.defaultLibraryId)) {
    throw new Error(
      `defaultLibraryId "${config.defaultLibraryId}" not found in libraries`,
    );
  }
}

function createConfigFromPaths(paths: string[]): LibraryConfig {
  const libraries: LibraryDefinition[] = paths.map((p) => ({
    id: generateLibraryId(p),
    path: p,
  }));

  return {
    libraries,
    defaultLibraryId: libraries[0]?.id ?? "",
  };
}

export function generateLibraryId(libraryPath: string): string {
  const basename = path.basename(libraryPath, ".library");
  // Create a safe ID from the basename
  const safeId = basename
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return safeId || `library-${Date.now()}`;
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

// Discover libraries from Eagle API
async function discoverLibrariesFromAPI(): Promise<string[]> {
  const { discoverLibraryPath } = await import("./library/discover-library-path");

  try {
    const libraryPath = await discoverLibraryPath();
    return [libraryPath];
  } catch {
    return [];
  }
}
