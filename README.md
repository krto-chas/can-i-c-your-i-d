# First Pipeline Challenge - Silver & Gold Edition 🥈🥇

![CI/CD Pipeline](https://github.com/krto-chas/can-i-c-your-i-d//actions/workflows/ci.yml/badge.svg)

Workflow: [CI/CD Pipeline](https://github.com/krto-chas/can-i-c-your-i-d//actions/workflows/ci.yml)

Live deployment: [https://your-render-app.onrender.com/](https://can-i-c-your-i-d-stoffe.onrender.com/)

## About

Week 4 CI/CD Pipeline project with complete GitHub Actions automation.
## 📊 Pipeline Status
# First Pipeline Challenge — CI/CD with GitHub Actions (Week 4)

![CI/CD Pipeline](https://github.com/krto-chas/can-i-c-your-i-d/actions/workflows/ci.yml/badge.svg) ![Render](https://img.shields.io/badge/deploy-render-blue?logo=render)

Repository: https://github.com/krto-chas/can-i-c-your-i-d

Live deployment: https://can-i-c-your-i-d-stoffe.onrender.com/

Summary
-------
This project demonstrates a full CI/CD pipeline using GitHub Actions for a Node.js + Docker app. Today's work implements and verifies automated builds, tests, Docker image creation, optional Docker Hub push, Render deployment, and Slack notifications.

Architecture
------------
Code Push → GitHub Actions → Lint & Test (matrix) → Docker Build & Test → Docker Hub Push (optional) → Deploy to Render → Slack notifications

What I implemented today
-----------------------
- Multi-version Node.js testing (Node 18, 20, 22) using a matrix job
- Linting with ESLint and a security audit (`npm audit`)
- Test suite execution and code coverage (`c8`)
- Docker image build and smoke-test (container start + /health check)
- Docker Hub push (runs on `main` when `DOCKER_USERNAME`/`DOCKER_PASSWORD` secrets are set)
- Automatic deploy to Render on `main` (uses `RENDER_DEPLOY_HOOK` secret)
- Slack notifications for deploy success/failure (uses `SLACK_WEBHOOK` secret)
- Small safeguards in workflow:
  - Validation step to ensure `DOCKER_USERNAME` is set before tagging/pushing
  - Debug step that prints the (masked) length of `DOCKER_USERNAME` to help detect hidden whitespace

App endpoints
-------------
- `GET /` — Main page (static `public/index.html`)
- `GET /health` — Health check JSON
- `GET /status` — App status

Required GitHub secrets
-----------------------
Set these at: Settings → Secrets and variables → Actions

- `DOCKER_USERNAME` — Docker Hub username (e.g. `krto-chas`)
- `DOCKER_PASSWORD` — Docker Hub password or access token
- `RENDER_DEPLOY_HOOK` — Render deploy hook URL (from your Render service settings)
- `SLACK_WEBHOOK` — Incoming Webhook URL for Slack (optional)

How to run locally
-------------------
1. Install dependencies
```bash
npm install
```

2. Run tests and lint
```bash
npm test
npm run lint
npm run test:coverage
```

3. Run locally
```bash
npm start
# or with docker-compose
docker compose up --build
```

How to trigger CI / deploy
--------------------------
1. Add your GitHub Secrets listed above.
2. Push to `main` to trigger Docker push + Render deploy (if secrets are set).
3. For quick testing, create an empty commit:
```bash
git commit --allow-empty -m "Trigger CI"
git push
```

Notes & troubleshooting
-----------------------
- If you see `Error parsing reference: "***/..."` in the Docker tag/push step, it means the `DOCKER_USERNAME` expansion produced an invalid value (common causes: empty secret, extra whitespace or accidental placeholder `***`). Re-set the secret via GitHub settings and re-run the workflow.
- If Slack messages don't appear, verify `SLACK_WEBHOOK` is an Incoming Webhook URL (starts with `https://hooks.slack.com/services/...`).
- If Render doesn't deploy, verify `RENDER_DEPLOY_HOOK` is the correct hook URL from your Render service and that the secret is set.

Where to look for logs
----------------------
- GitHub Actions → the workflow run shows build/test/docker steps and logs.
- Render dashboard → service → deploys shows incoming deploy events and logs.

Useful commands
---------------
```bash
# Trigger CI
git commit --allow-empty -m "Trigger CI"
git push

# Test deploy hook manually (replace with your hook)
curl -X POST 'https://api.render.com/deploy/srv-abc123/01a2b3c4'
```

If you want, I can:
- add a status badge for the Render URL (if desired),
- add a README section with screenshots from the Actions run,
- or clean up any remaining TODOs in the workflow.

---
Updated to reflect work done on: 2026-02-11

Workflow docs
-------------
The GitHub Actions workflow that runs the pipeline is in [.github/workflows/ci.yml](.github/workflows/ci.yml).
Check that file for job definitions, secrets required, and the Docker/Render deploy steps.
