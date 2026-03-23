# Eagle WebUI

A web interface for the [Eagle](https://eagle.cool/) image viewer application.

> [!NOTE]
> Looking for an iOS app? Check out [Eagle Viewer for iOS](https://github.com/naamiru/eagle-viewer-ios) - a native iPhone app for viewing your Eagle library.

## Screenshots

<table>
<tr>
<td width="70%">

![PC](docs/screenshots/pc.png)

</td>
<td width="30%">

![Mobile](docs/screenshots/mobile.png)

</td>
</tr>
</table>

## Features

- Read-only viewer that won't modify your library, or consume extra storage
- Responsive UI for desktop and mobile
- Multi-language support in English, Japanese, Korean, and Chinese (Simplified/Traditional)
- Simple one-command setup

## Requirements

- Node.js >= 18.18.0
- Eagle app 4.x

## Installation and Usage

Make sure the Eagle app is running on the same machine, then run:

```bash
npx @naamiru/eagle-webui
```

Then open http://localhost:34917/ in your browser.

### Accessing from Other Devices

Make the interface reachable from other devices on your network:

```bash
npx @naamiru/eagle-webui --hostname 0.0.0.0
```

After running this command, open `http://<your-computer's-LAN-IP>:34917/` from each device.

**⚠️ Security Warning:** This application serves images without authentication. Do not expose it to public networks. If you need remote access, I recommend using a VPN—services like [Tailscale](https://tailscale.com) could help.

### Command-line Options

| Option                 | Description                                                                         |
| ---------------------- | ----------------------------------------------------------------------------------- |
| `--hostname`           | Bind server to a specific hostname or IP address (default: localhost)               |
| `--port`               | Server port number (default: 34917)                                                 |
| `--eagle-library-path` | Path to the Eagle library folder (if omitted, detected automatically via Eagle API) |
| `--eagle-api-url`      | Eagle API endpoint for library detection (default: http://localhost:41595)          |

### Docker

Run with Docker Compose:

```bash
# Set your library path
export EAGLE_LIBRARY_PATH=/path/to/Your.library

# Build and run
docker compose up -d
```

Then open http://localhost:34917/ in your browser.

#### Docker Compose Configuration

Create a `docker-compose.override.yml` for custom setup:

```yaml
services:
  eagle-webui:
    volumes:
      - /path/to/Your.library:/libraries:ro
```

For multiple libraries:

```yaml
services:
  eagle-webui:
    environment:
      - EAGLE_LIBRARY_PATH='["/libraries/personal", "/libraries/work"]'
    volumes:
      - /path/to/Personal.library:/libraries/personal:ro
      - /path/to/Work.library:/libraries/work:ro
```

**⚠️ Security Warning:** When using Docker, avoid exposing the port to public networks. Use `127.0.0.1:34917:34917` if you only want local access.

### Multi-Library Support

You can configure multiple Eagle libraries and switch between them via the UI.

#### Using Environment Variable

Set `EAGLE_LIBRARY_PATH` to a JSON array of paths:

```bash
EAGLE_LIBRARY_PATH='["/path/to/Personal.library", "/path/to/Work.library"]' npx @naamiru/eagle-webui
```

For a single library, just use the path directly:

```bash
EAGLE_LIBRARY_PATH=/path/to/My.library npx @naamiru/eagle-webui
```

#### Using Config File

Create an `eagle-libraries.json` file in your working directory for more control:

```json
{
  "libraries": [
    { "id": "personal", "path": "/path/to/Personal.library", "name": "Personal" },
    { "id": "work", "path": "/path/to/Work.library", "name": "Work" }
  ],
  "defaultLibraryId": "personal"
}
```

**Config File Options:**

| Field                | Description                                                    |
| -------------------- | -------------------------------------------------------------- |
| `libraries`          | Array of library definitions                                   |
| `libraries[].id`     | Unique identifier for the library (used in URLs)               |
| `libraries[].path`   | Absolute path to the `.library` folder                         |
| `libraries[].name`   | Display name shown in the UI (optional)                        |
| `defaultLibraryId`   | ID of the default library to load                              |

When multiple libraries are configured, a dropdown selector appears in the sidebar to switch between them.
