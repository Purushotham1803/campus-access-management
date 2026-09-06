# Deploying Campus Access Management

## Live deployment (Render + GitHub Pages)

- Frontend: https://purushotham1803.github.io/campus-access-management/
- API Gateway: https://campus-access-gateway.onrender.com
- All 5 backend services + the deployment topology are defined in `render.yaml`
  (a Render Blueprint) — Render creates one free web service per entry.
- Database: Aiven free MySQL (credentials set directly in each Render
  service's dashboard as `sync: false` env vars, not in this repo).

### Reliability on Render's free tier

Free web services on Render sleep after ~15 minutes idle, and a cold
Spring Boot boot can take 20-40s+. Three things address this:

1. **`JAVA_TOOL_OPTIONS` heap caps** (`render.yaml`) — each service is capped
   at `-Xmx400m` to stay well inside Render's free 512MB per-instance limit,
   reducing the chance of an OOM kill turning into a crash-loop.
2. **Gateway timeout raised** (`api-gateway/application.yml`,
   `spring.cloud.gateway.httpclient.response-timeout: 55s`) — long enough
   for a downstream service to finish a cold boot before the gateway gives
   up and returns a premature 502.
3. **Keep-alive ping** (`.github/workflows/keep-alive.yml`) — a GitHub
   Actions cron every 10 minutes pings all 5 services, so a real visitor
   rarely hits a genuinely cold instance. Runs on GitHub's infrastructure,
   independent of anyone's own machine.

On top of that, the login page (`login.component.ts`) auto-retries up to 4
times with a visible countdown if it does hit a cold-start-shaped error
(timeout, 502/503/504), instead of leaving a stale error on screen.

## What changed from the local-dev setup

The app previously only worked pointed at `localhost` with secrets committed
in plain text. That's now fixed:

- **Every secret and hostname is externalized.** All 5 Spring Boot services
  read `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USERNAME`, `DB_PASSWORD`,
  `JWT_SECRET`, `JWT_EXPIRATION`, `JPA_DDL_AUTO` from environment variables
  (falling back to the old `localhost`/demo defaults if unset, so local
  `mvn`/`java -jar` runs are unaffected). `api-gateway` additionally reads
  `CORS_ALLOWED_ORIGIN` and per-service URLs
  (`AUTH_SERVICE_URL`, `USER_SERVICE_URL`, `ACCESS_SERVICE_URL`,
  `APPROVAL_SERVICE_URL`).
- **The frontend no longer bakes `http://localhost:8080` into the JS bundle.**
  `campus-frontend/src/environments/environment.ts` (dev) points at
  `http://localhost:8080`; `environment.prod.ts` (swapped in automatically by
  `ng build --configuration production` via `angular.json`'s
  `fileReplacements`) uses an **empty, relative** base URL instead. Verified:
  the dev bundle contains `localhost:8080`, the production bundle contains
  zero occurrences of it.
- **Containerized.** Each service has a multi-stage `Dockerfile`
  (Maven build → `eclipse-temurin:21-jre-alpine` runtime); the frontend has
  its own `Dockerfile` (Angular build → `nginx:alpine`). `docker-compose.yml`
  wires MySQL + all 5 services + the frontend together.
- **No CORS needed in the containerized deployment.** `campus-frontend/nginx.conf`
  serves the built Angular app *and* reverse-proxies `/auth/`, `/users/`,
  `/access/`, `/approvals/` to the `api-gateway` container. Since the browser
  only ever talks to the frontend's own origin, this is same-origin end to
  end — the gateway's CORS config becomes a fallback, not a requirement.

## ⚠️ I could not verify the Docker build in this session

This machine doesn't have Docker installed (`docker` isn't on PATH), so the
`Dockerfile`s and `docker-compose.yml` below are written carefully but
**untested by an actual build**. Everything else in this document (env-var
config, the environment.ts/environment.prod.ts split, the production Angular
build) *was* verified locally. Before trusting the containers in anything
important, run the build yourself (see below) and fix anything that surfaces
— Maven/Node base image tags in particular are the most likely thing to need
a bump by the time you read this.

## Running locally (unchanged)

Nothing here changes local development. `mvn package` + `java -jar` for each
service and `ng serve` for the frontend still work exactly as before, using
the same `localhost`/demo defaults.

## Deploying with Docker Compose

1. Install Docker (with the `docker compose` v2 plugin — not the legacy
   `docker-compose` v1 binary; `depends_on: condition: service_healthy` needs it).
2. Copy the env template and fill in real secrets:
   ```
   cp .env.example .env
   ```
   Generate a real JWT secret, e.g. `openssl rand -hex 32` — **do not** reuse
   the demo secret that was previously hardcoded in this repo's `schema.txt`;
   treat that value as already leaked.
3. Build and start everything:
   ```
   docker compose up --build
   ```
4. Open `http://localhost:8090` (the frontend container's published port).
   The gateway, MySQL, and the other 4 services are only reachable from
   inside the Docker network, not published to the host — the frontend's
   nginx is the single public entry point.
5. First boot seeds the same demo accounts as local dev
   (`user-service`'s `DataInitializer`) — see the next section.

## Before this is a *real* production deployment

These are genuinely not done, and I'm listing them rather than implying the
app is fully production-hardened:

- **Rotate the demo accounts.** `admin/admin`, `student/student`,
  `faculty/faculty`, `security/security` get seeded automatically on first
  boot against an empty `users` table — including in a fresh production
  deploy. There's no "change password" feature in the UI yet; today the only
  way to rotate them is directly in the database. Do this before exposing
  the app publicly.
- **TLS.** Nothing here terminates HTTPS. Put this behind a reverse proxy
  or platform load balancer that does (e.g. Caddy, Traefik, or your
  cloud provider's managed load balancer/ingress).
- **Schema migrations.** `JPA_DDL_AUTO=update` auto-alters tables on every
  boot, which is fine for a first deploy but risky once real data exists —
  a bad entity change could silently alter a live table. Move to a real
  migration tool (Flyway/Liquibase) and set `JPA_DDL_AUTO=validate` for
  ongoing releases.
- **Secrets storage.** `.env` is a fine starting point; a real deployment
  should pull `JWT_SECRET`/`DB_ROOT_PASSWORD` from your platform's secret
  manager instead of a file on disk.
- **No automated backups, monitoring, or log aggregation** are set up for
  the MySQL volume or the services.
