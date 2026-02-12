# I-C-your-I-D | DevSecOps Pipeline

![CI/CD Pipeline](https://github.com/krto-chas/can-i-c-your-i-d/actions/workflows/ci.yml/badge.svg)
![Node.js](https://img.shields.io/badge/node-18%20|%2020%20|%2022-green?logo=node.js)
![Docker](https://img.shields.io/badge/docker-alpine-blue?logo=docker)
![Render](https://img.shields.io/badge/deploy-render-blue?logo=render)

**Live deployment:** https://can-i-c-your-i-d-stoffe.onrender.com/

**Repository:** https://github.com/krto-chas/can-i-c-your-i-d

---

## About

A DevSecOps dashboard application built with Node.js and Express, featuring a complete CI/CD pipeline with GitHub Actions. The app includes an interactive terminal UI, real-time metrics, security scanning, and multiple easter eggs.

## Pipeline Architecture

```
Code Push → GitHub Actions
  ├── Lint & Test (Node 18, 20, 22 matrix)
  ├── Security Audit (npm audit)
  ├── Docker Build & Smoke Test
  ├── Trivy Security Scanning (image + filesystem + secrets)
  ├── SARIF Upload to GitHub Security
  ├── Docker Hub Push (main branch)
  ├── Deploy to Render (main branch)
  └── Slack Notifications (success/failure)
```

## Features

### Dashboard
- Interactive terminal UI for exploring API endpoints
- Split-view side panel for endpoint data and documentation
- Live metrics bar with auto-refresh
- Dynamic endpoint discovery from Express router
- Pretty JSON rendering with syntax highlighting for browser requests

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Dashboard (interactive UI) |
| `/health` | GET | Health check with uptime, memory, environment |
| `/metrics` | GET | Performance metrics (request count, response times, status codes) |
| `/status` | GET | App status with easter egg |
| `/version` | GET | Build version, commit SHA, uptime |
| `/ready` | GET | Readiness probe for container orchestration |
| `/live` | GET | Liveness probe |
| `/api/echo` | POST | Echo back a JSON message |
| `/api/endpoints` | GET | Auto-discovered list of all routes |

### Hidden Endpoints
| Endpoint | Description |
|----------|-------------|
| `/secret` | A hidden reward |
| `/konami` | Cheat code activated |
| `/coffee` | HTTP 418 - I'm a teapot |

### Security
- **Trivy image scanning** - Scans Docker image for OS and library vulnerabilities
- **Trivy filesystem scanning** - Scans npm packages for known CVEs
- **Trivy secret scanning** - Detects accidentally committed secrets
- **SARIF upload** - Results visible in GitHub Security tab
- **npm audit** - Dependency vulnerability checking
- **Non-root container** - Docker image runs as `node` user
- **npm removed from production image** - Reduces attack surface by removing npm and its bundled dependencies after install

### Docker (Multi-Stage Build)

The Dockerfile uses a two-stage build for security and size optimization:

```
Stage 1 (build):  node:18-alpine + npm  →  installs dependencies
Stage 2 (production):  node:18-alpine only  →  copies node_modules, removes npm
```

- **Stage 1** has full npm available for `npm ci --omit=dev`
- **Stage 2** copies only `node_modules` from Stage 1, then removes npm entirely
- System packages upgraded at build time (`apk upgrade`) to patch OS-level CVEs
- Health check built into container (`wget` to `/health`)
- Runs as non-root `node` user
- Final image contains only: node runtime + app code + production dependencies
- To rebuild/reinstall: `docker build -t can-i-c-your-i-d .` (npm is always available at build time)

## CI/CD Pipeline (ci.yml)

### Job 1: Test & Quality
- Multi-version Node.js testing (18, 20, 22) via matrix strategy
- ESLint linting
- Test execution with code coverage (`c8`)
- Security audit (`npm audit`)
- Coverage report uploaded as artifact

### Job 2: Docker Build & Security Scan
- Docker image build and smoke test (start container + curl `/health`)
- Trivy image scan (CRITICAL + HIGH severity)
- Trivy filesystem scan (npm packages)
- Trivy secret scan
- SARIF results uploaded to GitHub Security tab
- Docker Hub push (main branch only)

### Job 3: Deploy
- Automatic deploy to Render via deploy hook (main branch only)
- Slack notification with deployment status, commit SHA, and workflow link

### Job 4: Failure Notification
- Slack alert on pipeline failure with commit details and log link

## Required GitHub Secrets

| Secret | Description |
|--------|-------------|
| `DOCKER_USERNAME` | Docker Hub username |
| `DOCKER_PASSWORD` | Docker Hub password or access token |
| `RENDER_DEPLOY_HOOK` | Render deploy hook URL |
| `SLACK_WEBHOOK` | Slack Incoming Webhook URL (optional) |

## Local Development

```bash
# Install dependencies
npm install

# Run the app
npm start
# Visit http://localhost:3000

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Lint
npm run lint

# Security audit
npm run security
```

## Docker

```bash
# Build
docker build -t can-i-c-your-i-d .

# Run
docker run -p 3000:3000 can-i-c-your-i-d

# Visit http://localhost:3000
```

## Vulnerability Management

The project uses several strategies to manage dependencies:

- **npm overrides** in `package.json` to force patched versions of transitive dependencies (`tar`, `semver`, `ip`)
- **npm removed from production Docker image** - eliminates npm's own bundled vulnerable packages (tar, semver, glob, etc.) from the final image
- **Alpine system packages upgraded** at Docker build time to patch OS-level CVEs (busybox, ssl_client, libcrypto, etc.)

### Known Accepted Risks
- `ip` (CVE-2024-29415) - No upstream fix available yet
- `brace-expansion` (Low) - ReDoS, deep in dependency tree
- `jsdiff` (Low) - DoS in parsePatch

## Trigger CI

```bash
# Push to main triggers full pipeline
git push origin main

# Or create an empty commit to trigger
git commit --allow-empty -m "Trigger CI"
git push
```

## Troubleshooting

- **Docker push fails:** Verify `DOCKER_USERNAME` secret has no extra whitespace
- **Slack not working:** Ensure `SLACK_WEBHOOK` starts with `https://hooks.slack.com/services/...`
- **Render not deploying:** Check `RENDER_DEPLOY_HOOK` URL in Render service settings
- **Trivy SARIF upload fails:** Ensure `security-events: write` permission is set in workflow

## Workflow Files

| File | Purpose |
|------|---------|
| `.github/workflows/ci.yml` | Main CI/CD pipeline (test, build, scan, deploy) |
| `.github/workflows/pipeline.yml` | Secondary pipeline (staging/production environments) |
| `.github/workflows/upload-sarif-manual.yml` | Manual SARIF upload workflow |

---

Updated: 2026-02-12
