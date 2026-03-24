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

Place your Eagle libraries under `./eagle` before starting the app:

```text
eagle/
  Personal.library/
  Work.library/
```

Then run:

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

| Option       | Description                                                           |
| ------------ | --------------------------------------------------------------------- |
| `--hostname` | Bind server to a specific hostname or IP address (default: localhost) |
| `--port`     | Server port number (default: 34917)                                   |

### Docker

Run with Docker Compose:

```bash
# Mount the parent folder that contains your *.library directories
export EAGLE_ROOT=/path/to/eagle-root

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
      - /path/to/eagle-root:/eagle:ro
```

The mounted folder should look like this:

```text
eagle-root/
  Personal.library/
  Work.library/
```

**⚠️ Security Warning:** When using Docker, avoid exposing the port to public networks. Use `127.0.0.1:34917:34917` if you only want local access.

### Multi-Library Support

The app reads every valid `.library` directory inside `/eagle` in Docker, and falls back to `./eagle` for local runs.
