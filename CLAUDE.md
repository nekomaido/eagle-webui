# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Eagle WebUI is a Next.js 15 web application that provides a read-only interface for browsing Eagle image libraries. It serves as a local web server that reads Eagle library files directly from disk and displays them via a responsive web interface.

## Development Commands

```bash
# Development server (with Turbopack)
npm run dev

# Production build (standalone output for deployment)
npm run build

# Start production server
npm start

# Run directly via npx (loads libraries from ./eagle)
npx @naamiru/eagle-webui

# Linting
npm run lint

# Format code
npm run format

# Run tests
npm test

# Run a single test file
npm test -- data/store.test.ts

# Run tests in watch mode
npm test -- --watch
```

## Architecture

### Multi-Library System

The application supports multiple Eagle libraries via a dynamic routing system:

- **Library Discovery**: Libraries are discovered by scanning `/eagle` first, then `./eagle`, for child `.library` folders containing `metadata.json`
- **Routing**: Two parallel route groups handle library access:
  - `app/(root)/*` - Single-library mode (backward compatible)
  - `app/(library)/library/[libraryId]/*` - Multi-library mode with explicit library ID
- **Store Registry** (`data/store.ts`): Manages per-library Store instances with lazy initialization and error state tracking

### Data Layer

**Store Class** (`data/store.ts`): Central data access layer providing:
- Folder/smart folder item queries with sorting and filtering
- Search (name, tags, url, annotation, comments, folder names)
- Tag filtering
- Item counts computation

**Import Pipeline** (`data/library/import-metadata.ts`):
1. Reads `metadata.json` for folder structure and smart folder definitions
2. Reads `mtime.json` to enumerate all items
3. Concurrently loads individual item metadata (max 32 concurrent)
4. Validates with AJV schemas
5. Builds smart folder rule trees and evaluates item matches

**Smart Folders** (`data/smart-folders.ts`): Complex rule-based filtering supporting:
- Text matching (contains, regex, empty/not-empty)
- Collection matching (tags, folders with union/intersection)
- Date ranges (before/after/between/within)
- Number comparisons (width, height, fileSize, duration)
- Color similarity (redmean distance algorithm)
- Shape categories (landscape, portrait, square, panoramic)
- Nested folder hierarchies with recursive rule evaluation

### Image Serving

Images are served via Next.js API routes to avoid exposing full file system paths:
- `/api/items/image?id={itemId}&libraryPath={path}` - Full resolution images
- `/api/items/thumbnail?id={itemId}&libraryPath={path}` - Thumbnails from Eagle `.info` folders

The server reads files directly from disk and pipes them through the response with proper MIME types and ETag caching.

### State Management

- **Server State**: Zustand stores in `stores/` directory for client-side state (slider position, UI preferences)
- **Server Actions**: `actions/` directory contains server actions for updating user settings persisting to local JSON files
- **Settings Storage**: User preferences stored in local JSON files (see `data/settings.ts`)

### Internationalization

Uses `next-intl` for client and server components:
- Supported locales: en, zh-cn, zh-tw, ja, ko
- Message files in `i18n/messages/{locale}.json`
- Locale detection via `Accept-Language` header with fallback to `en`

### Sorting System

Two-tier sorting architecture:
1. **Global Sort** (`GlobalSortOptions`): Default sort method applied when folder uses "GLOBAL"
2. **Folder Sort** (`FolderSortOptions`): Per-folder override options

Sort methods include: MANUAL, IMPORT, MTIME, BTIME, FILESIZE, RESOLUTION, RATING, DURATION, NAME, EXT, RANDOM

Special handling for "newest first" methods (MTIME, BTIME, IMPORT) where direction inverts.

## Key Implementation Details

### Concurrency Control

Item metadata loading uses `p-limit` to cap concurrent file operations at 32, preventing file descriptor exhaustion on large libraries.

### Error Handling

Custom `LibraryImportError` class with error codes for user-facing error messages. Import failures are caught and displayed via `ImportErrorScreen` component with recovery actions.

### Smart Folder Rule Evaluation

Rules are parsed into typed objects and evaluated against items. Each rule type has specific matching logic:
- Color rules use redmean distance for perceptual color similarity
- Date rules handle millisecond timestamps with day boundary adjustments
- Shape rules categorize aspect ratios
- Text rules are case-insensitive with support for regex

## Testing

- Framework: Vitest with jsdom environment
- Test location: Co-located `.test.ts` files next to source
- Coverage: Core data layer has good test coverage (import, sort, smart folders)

## Deployment

- **Output Mode**: `standandalone` for containerized deployment
- **Entry Point**: `start.js` for npm package usage
- **Docker**: Multi-stage build with Alpine Linux final image, mounting the Eagle parent folder to `/eagle`
- **Default Port**: 34917

## Important Constraints

- Read-only access: Never modifies Eagle library files
- Eagle 4.x only: Validates `applicationVersion` in metadata.json
- No authentication: Intended for local network use only
- Library path required: `/eagle` in Docker or `./eagle` locally must contain one or more valid Eagle `.library` directories
