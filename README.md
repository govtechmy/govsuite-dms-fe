# govsuite-dms-fe

Malaysian government frontend application — React 19 + TypeScript + Vite, built on `@govtechmy/myds-react`.

## Development

```bash
pnpm install
pnpm run dev
```

See `AGENTS.md` for project structure, conventions, and coding guidelines.

## Offline (pendrive) deployment

Deployment scripts for running the containerized frontend on an **internal server with no internet access**. The Docker image is built and packaged on a machine with internet/Docker access, transferred over via pendrive, and loaded/started entirely offline on the target server — no internet access is required on the server at any point.

The container serves the built app via nginx and injects `VITE_*` environment variables at **runtime** (not build time), so the same image can be deployed with different `frontend.env` values without rebuilding — see `docker/entrypoint.sh`.

### Files

| File                     | Purpose                                                                                                                                |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------- |
| `package-for-desktop.sh` | Run on a machine **with** internet/Docker access. Builds the frontend image and assembles a ready-to-copy deploy folder on the Desktop |
| `deploy.sh`              | Run on the **offline target server**. Loads the image and starts the container, no internet needed                                     |
| `docker-compose.yml`     | Compose definition for the `frontend` service (profile: `production`)                                                                  |
| `Dockerfile`             | Multi-stage build: `node:24-alpine` build stage → `nginx:alpine` production stage                                                      |
| `frontend.env.example`   | Template for `VITE_*` environment variables                                                                                            |
| `frontend.env`           | Your actual values (gitignored, created by you)                                                                                        |

### Setup

Before running `package-for-desktop.sh`, create your environment file from the template if you haven't already:

```bash
cp frontend.env.example frontend.env
```

Then edit `frontend.env` with the correct values for the target environment (API base URL, app name, support email, etc).

**Requirements:** Docker with the `buildx` plugin (for building the image), and the Docker Compose v2 plugin (`docker compose ...`), on both the machine running `package-for-desktop.sh` and the target server.

### Deployment flow

1. **On a machine with internet/Docker access**, from this repo, run:

   ```bash
   ./package-for-desktop.sh
   ```

   This:
   - Builds the image for **both** `amd64` and `arm64` using `docker buildx`
   - Scans each image with `docker scout cves --only-fixed` and prints any fixable CRITICAL/HIGH severity CVEs found (informational only — does not block packaging; skipped with a warning if `docker scout` isn't installed)
   - Saves each image as `frontend-amd64.tar` and `frontend-arm64.tar`
   - Copies `deploy.sh`, `docker-compose.yml`, `frontend.env`, and both tars into `~/Desktop/govsuite-fe-deploy`

   > Building both architectures roughly doubles the build time on the build machine, and the deploy folder ends up with two tars instead of one. In exchange, the resulting folder can be deployed to a server of either architecture — `deploy.sh` auto-detects the server's `uname -m` and loads only the matching tar.

2. **Copy the whole `govsuite-fe-deploy` folder** from the Desktop onto a pendrive.

3. **Copy the folder from the pendrive onto the target server** (no internet needed on the server).

4. **On the target server**, inside that folder, run:

   ```bash
   ./deploy.sh
   ```

   This:
   - Verifies Docker, Docker Compose v2, `frontend.env`, `docker-compose.yml`, and `frontend-<arch>.tar` are all present
   - Detects the server's architecture and loads the matching image with `docker load`, then retags it as `govsuite-dms-fe:latest`
   - Starts the `frontend` service with `docker compose --profile production up -d`
   - Polls the container's health check for up to 30 seconds until it reports `healthy`
   - Prints the running container status and the app URL:
     ```
     http://localhost
     ```

5. Deployment is complete — the app is running on the server at `http://localhost` (port 80).

### Updating a deployment

To ship a new build, re-run `./package-for-desktop.sh` on the build machine, copy the refreshed `govsuite-fe-deploy` folder to the server, and re-run `./deploy.sh` — it will load the new image, retag it, and restart the container via `docker compose up -d`.
