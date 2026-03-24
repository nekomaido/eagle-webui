# Library Discovery Design

The web UI resolves Eagle libraries from `/eagle` first, then `./eagle`, before any asset queries run. Resolution happens once during store initialization and the result is cached in memory.

## Resolution Order

1. Read `/eagle`.
2. If `/eagle` has no valid libraries, read `process.cwd()/eagle`.
3. Treat each child directory containing `metadata.json` as a valid Eagle library.
4. Use the first discovered valid child as the default library id.

If neither `/eagle` nor `./eagle` contains valid libraries, throw a `LibraryImportError` with the code `LIBRARY_PATH_NOT_FOUND`.

### Error contract

- Implement the error using `LibraryImportError` and the `LibraryImportErrorCode` union in `data/errors/library-import-error.ts`.
- Use the `LIBRARY_PATH_NOT_FOUND` code whenever discovery fails. The shared error helper maps codes to user-facing messages.

## Store Integration

- `data/store.ts` exposes multi-library access through `getStore(libraryId?)`.
- `data/library-config.ts` is responsible for scanning `/eagle` first, then `./eagle`, and returning library definitions.
- Subsequent lookups must reuse the cached config rather than repeating the scan.

## Testing Requirements

Use **Vitest** to cover the discovery logic:
- Successful scan when `/eagle` or `./eagle` contains multiple valid child libraries.
- Invalid children are ignored when `metadata.json` is missing.
- Missing or empty library roots raise `LibraryImportError` with the `LIBRARY_PATH_NOT_FOUND` code.
- Unknown library ids raise `LibraryImportError` with the `LIBRARY_NOT_FOUND` code.
