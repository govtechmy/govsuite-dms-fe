# govsuite-dms-fe

Malaysian government frontend application — React 19 + TypeScript + Vite, built on `@govtechmy/myds-react`.

## Development

```bash
cp frontend.env.example frontend.env   # fill in your local values (gitignored)
pnpm install
pnpm run dev
```

When `PROXY=ON` in `frontend.env`, requests to `/api/*` made by the app are proxied by the Vite dev server to `DEV_API_PROXY_TARGET` (see [`vite.config.ts`](./vite.config.ts)), so local dev mirrors the same-origin `/api` behaviour used in production. When `PROXY` is off/unset, the dev server does not intercept `/api` at all and `VITE_API_BASE_URL` must be the backend's full URL instead.

See `AGENTS.md` for project structure, conventions, and coding guidelines.

## Architecture: frontend, backend, and S3 are separate hosts

This app is deployed as three independent services, each typically on its own VM:

- **Frontend** — this repo. An nginx container that serves the built static app (HTML/CSS/JS) and reverse-proxies API calls.
- **Backend** — a separate API service, reachable only over the **private network** from the frontend.
- **S3 (or S3-compatible storage)** — holds uploaded documents. The browser talks to it **directly** using short-lived presigned URLs issued by the backend; this traffic never passes through the frontend.

```
Browser ──(static assets)──► Frontend nginx
Browser ──(/api/*)─────────► Frontend nginx ──(private network)──► Backend
Browser ──(file bytes)─────────────────────────────────────────► S3 (presigned URL)
```

The key point: the browser never talks to the backend directly. All `/api/*` calls are same-origin (`VITE_API_BASE_URL`, e.g. `/api/v1`) and are reverse-proxied by the frontend's nginx to `BACKEND_INTERNAL_URL`, the backend's private address. This means the backend's host/port is **never** exposed in any browser request or response, so it can be firewalled off from the public internet entirely — only the frontend VM needs network access to it.

File uploads/downloads intentionally bypass this proxy: the backend issues a presigned S3 URL, and the browser uploads/downloads the file bytes straight to/from S3. Proxying that traffic through the frontend would remove the bandwidth-offloading benefit presigned URLs are meant to provide.

**Opting out:** the `PROXY` env var is an escape hatch back to the original direct-connection setup — see [Environment variables](#environment-variables). Setting `PROXY=OFF` (or leaving it unset) disables the `/api` reverse proxy entirely, and the browser calls `VITE_API_BASE_URL` (now the backend's full public URL) directly, bypassing the frontend for all API traffic. `PROXY=ON` is the recommended mode, since it's what actually keeps the backend off the public internet.

## Environment variables

All variables are documented in [`frontend.env.example`](./frontend.env.example), the single source of truth. Copy it to `frontend.env` (gitignored) and fill in real values — never commit `frontend.env`.

| Variable               | Prefix rule                                                  | Where it's used                                                                                           | Required                                   | Notes                                                                                                                                                                                                                  |
| ---------------------- | ------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------- | ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `PROXY`                | Not `VITE_*` (deployment-only, never shipped to the browser) | Toggles the `/api` reverse proxy (`docker/entrypoint.sh`, `vite.config.ts`)                               | Recommended: `ON`                          | `ON` (case-insensitive) enables the reverse proxy. Anything else/unset disables it and reverts to direct browser→backend calls. See [Architecture](#architecture-frontend-backend-and-s3-are-separate-hosts).          |
| `VITE_APP_NAME`        | `VITE_*` (public, browser-visible)                           | App display name (`index.html` title, UI)                                                                 | Yes                                        | —                                                                                                                                                                                                                      |
| `VITE_API_BASE_URL`    | `VITE_*` (public, browser-visible)                           | Base path for every API call (`src/services/*.svc.ts`)                                                    | Yes                                        | When `PROXY=ON`: a **same-origin relative path** including the backend's own prefix, e.g. `/api/v1`, no trailing slash. When `PROXY` is off: the backend's **full public URL**, e.g. `http://10.20.51.42:3000/api/v1`. |
| `VITE_EMAIL_SUPPORT`   | `VITE_*` (public, browser-visible)                           | Support contact shown in the UI                                                                           | Yes                                        | —                                                                                                                                                                                                                      |
| `DEV_API_PROXY_TARGET` | Not `VITE_*` (dev-only, never shipped to the browser)        | Vite dev server's `/api` proxy target (`vite.config.ts`)                                                  | Dev only, when `PROXY=ON`                  | Backend **host:port only** (e.g. `http://localhost:3000`) — no `/api/v1` suffix; the full path is forwarded verbatim.                                                                                                  |
| `BACKEND_INTERNAL_URL` | Not `VITE_*` (deployment-only, never shipped to the browser) | Frontend nginx's `/api` reverse-proxy target (`docker/nginx.proxy.conf.template`, `docker/entrypoint.sh`) | Yes, in Docker/production, when `PROXY=ON` | Backend **host:port only** on the private network (e.g. `http://10.20.51.42:3000`) — no trailing slash, no `/api/v1` suffix. The container refuses to start without it when `PROXY=ON`.                                |

**Rule of thumb:** any variable prefixed `VITE_` is written into `env.js` at container startup and shipped to every browser (see `docker/entrypoint.sh`) — never put a private/internal address behind a `VITE_` prefix. `PROXY`, `DEV_API_PROXY_TARGET`, and `BACKEND_INTERNAL_URL` are deliberately unprefixed so they stay server-side only.

## Offline (pendrive) deployment

Deployment scripts for running the containerized frontend on an **internal server with no internet access**. The Docker image is built and packaged on a machine with internet/Docker access, transferred over via pendrive, and loaded/started entirely offline on the target server — no internet access is required on the server at any point.

The container serves the built app via nginx. At startup, `docker/entrypoint.sh`:

1. Writes all `VITE_*` environment variables into `env.js`, loaded by the browser as `window.__APP_ENV__`, so the same image can be deployed with different `frontend.env` values without rebuilding.
2. Picks a template based on `PROXY`: `docker/nginx.proxy.conf.template` (reverse-proxies `/api` to `BACKEND_INTERNAL_URL`, substituting only that variable — nginx's own runtime variables like `$host` are left untouched) when `PROXY=ON`, otherwise `docker/nginx.direct.conf.template` (static-only, no `/api` handling).
3. Runs `nginx -t` to validate the generated config before nginx starts.
4. Fails fast with a clear error if `PROXY=ON` but `BACKEND_INTERNAL_URL` is missing, rather than starting nginx with a broken proxy.

### Files

| File                                | Purpose                                                                                                                                               |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `package-for-desktop.sh`            | Run on a machine **with** internet/Docker access. Builds the frontend image and assembles a ready-to-copy deploy folder on the Desktop                |
| `deploy.sh`                         | Run on the **offline target server**. Loads the image and starts the container, no internet needed                                                    |
| `docker-compose.yml`                | Compose definition for the `frontend` service (profile: `production`)                                                                                 |
| `Dockerfile`                        | Multi-stage build: `node:24-alpine` build stage → `nginx:alpine` production stage                                                                     |
| `docker/entrypoint.sh`              | Runtime startup script — renders `env.js` and the nginx config (see above), validates it, then starts nginx                                           |
| `docker/nginx.proxy.conf.template`  | nginx config used when `PROXY=ON`: serves the static app, reverse-proxies `/api/*` to `BACKEND_INTERNAL_URL`, SPA fallback, security headers, gzip    |
| `docker/nginx.direct.conf.template` | nginx config used when `PROXY` is off/unset: static app + SPA fallback only, no `/api` handling                                                       |
| `frontend.env.example`              | Template for environment variables — `VITE_*` values (public, shipped to the browser) plus deployment-only values like `PROXY`/`BACKEND_INTERNAL_URL` |
| `frontend.env`                      | Your actual values (gitignored, created by you)                                                                                                       |

### Setup

Before running `package-for-desktop.sh`, create your environment file from the template if you haven't already:

```bash
cp frontend.env.example frontend.env
```

Then edit `frontend.env` with the correct values for the target environment (API base path, app name, support email, backend address, etc) — see the [Environment variables](#environment-variables) table above. When `PROXY=ON`, both `package-for-desktop.sh` and `deploy.sh` verify that `BACKEND_INTERNAL_URL` is also set in `frontend.env`, and exit immediately with a clear error if it's missing, before doing any build or deploy work.

**Requirements:** Docker with the `buildx` plugin (for building the image), and the Docker Compose v2 plugin (`docker compose ...`), on both the machine running `package-for-desktop.sh` and the target server.

### Deployment flow

1. **On a machine with internet/Docker access**, from this repo, run:

   ```bash
   ./package-for-desktop.sh
   ```

   This:
   - Verifies `frontend.env` exists, and if `PROXY=ON`, that `BACKEND_INTERNAL_URL` is also set
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
   - Verifies Docker, Docker Compose v2, `frontend.env` (including `BACKEND_INTERNAL_URL` if `PROXY=ON`), `docker-compose.yml`, and `frontend-<arch>.tar` are all present
   - Detects the server's architecture and loads the matching image with `docker load`, then retags it as `govsuite-dms-fe:latest`
   - Starts the `frontend` service with `docker compose --profile production up -d`
   - Polls the container's health check for up to 30 seconds until it reports `healthy`; if it times out, prints the last 50 lines of container logs to help diagnose the failure
   - Prints the running container status and the app URL:
     ```
     http://localhost
     ```

5. Deployment is complete — the app is running on the server at `http://localhost` (port 80). Ensure the backend VM's firewall only accepts inbound traffic on its API port from this frontend VM's private IP — that is what actually keeps the backend off the public internet.

### Updating a deployment

To ship a new build, re-run `./package-for-desktop.sh` on the build machine, copy the refreshed `govsuite-fe-deploy` folder to the server, and re-run `./deploy.sh` — it will load the new image, retag it, and restart the container via `docker compose up -d`.
