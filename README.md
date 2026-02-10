# First Pipeline Challenge - Silver & Gold Edition 🥈🥇

![CI/CD Pipeline](https://github.com/Sidestep-Error/can-i-c-your-i-d/actions/workflows/pipeline.yml/badge.svg)

Workflow: [CI/CD Pipeline](https://github.com/Sidestep-Error/can-i-c-your-i-d/actions/workflows/pipeline.yml)

Live deployment: [https://can-i-c-your-i-d.onrender.com/](https://can-i-c-your-i-d.onrender.com/)

## About

Week 4 Boiler Room Hackathon project focused on building a complete CI/CD pipeline.

## Architecture

```
Code Push -> GitHub Actions -> Tests -> Docker Build -> Trivy Scan -> Deploy
```

## Implemented

- Express app with endpoints:
  - `GET /`
  - `GET /status`
  - `GET /secret`
- Test suite in `test.js` that validates `/status` and `/secret`.
- Dynamic test port (`listen(0)`) to avoid local port conflicts.
- Docker support:
  - `Dockerfile`
  - `docker-compose.yml`
  - `.dockerignore`
- GitHub Actions pipeline in `.github/workflows/pipeline.yml`:
  - install dependencies
  - run tests
  - build Docker image
  - scan image with Trivy
  - optional deploy webhook trigger on push to `main`

## Deploy Webhook

Set repository secret in GitHub:

- Name: `DEPLOY_WEBHOOK_URL`
- Value: webhook URL from hosting provider

Deploy step runs only on push to `main` and only when the secret is set.

## Local Usage

Install and run:

```bash
npm install
npm start
```

Run tests:

```bash
npm test
```

Run with Docker Compose:

```bash
docker compose up --build
```

## Team Sync Tips

When several developers work in the same repo, sync often to avoid conflicts:

```bash
git fetch origin
git checkout main
git pull --ff-only origin main
git checkout <your-branch>
git rebase main
```

If rebase conflicts appear, resolve and continue before pushing.
