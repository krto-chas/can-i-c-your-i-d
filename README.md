# First Pipeline Challenge - Silver & Gold Edition 🥈🥇

![CI/CD Pipeline](https://github.com/YOUR-USERNAME/forked-pipeline/actions/workflows/ci.yml/badge.svg)

Workflow: [CI/CD Pipeline](https://github.com/YOUR-USERNAME/forked-pipeline/actions/workflows/ci.yml)

Live deployment: [https://your-render-app.onrender.com/](https://your-render-app.onrender.com/)

## About

Week 4 CI/CD Pipeline project with complete GitHub Actions automation.

## Architecture

```
Code Push → GitHub Actions → Lint & Test (3 Node versions) → Docker Build & Test → Docker Hub Push → Deploy to Render → Slack Notification
```

## ✨ Features Implemented

### Core Pipeline
- ✅ Multi-version Node.js testing (18, 20, 22)
- ✅ Linting with ESLint
- ✅ Security audits with `npm audit`
- ✅ Comprehensive test suite
- ✅ Code coverage reporting
- ✅ Docker image build & test
- ✅ Automatic deployment to Render
- ✅ Slack notifications

### Express App with Endpoints
- `GET /` - Main page
- `GET /health` - Health check
- `GET /status` - App status

### GitHub Actions Features
- 🚀 CI/CD Pipeline in `.github/workflows/ci.yml`:
  - Install dependencies
  - Run linting & security checks
  - Run tests on multiple Node versions
  - Generate code coverage reports
  - Build Docker image
  - Test Docker container
  - Push to Docker Hub
  - Deploy to Render
  - Slack notifications (success & failure)

## 🔐 Required GitHub Secrets

To enable all features, set these secrets in GitHub repo Settings → Secrets and variables → Actions:

### Deploy to Render
- **Name:** `RENDER_DEPLOY_HOOK`
- **Value:** Your Render deployment hook URL
  - Get from: Render Dashboard → Your Service → Settings → Manual Deploy

### Docker Hub (Optional, for Docker push)
- **Name:** `DOCKER_USERNAME`
- **Value:** Your Docker Hub username

- **Name:** `DOCKER_PASSWORD`
- **Value:** Your Docker Hub access token or password

### Slack Notifications (Optional)
- **Name:** `SLACK_WEBHOOK`
- **Value:** Your Slack webhook URL
  - Get from: Slack Workspace → Settings → Apps & Integrations → Incoming Webhooks

## 🛠️ Setup Instructions

### 1. Clone Repository
```bash
git clone <your-repo-url>
cd forked-pipeline
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Add GitHub Secrets
Go to **Settings → Secrets and variables → Actions** and add the secrets above.

### 4. Test Locally
```bash
npm test          # Run tests
npm run lint      # Run linter
npm run dev       # Start dev server
docker-compose up # Start with Docker Compose
```

### 5. Push to Trigger Pipeline
```bash
git add .
git commit -m "Add CI/CD pipeline"
git push
```

Then watch your pipeline in the **Actions** tab! 🚀

## 📊 Pipeline Status

View your pipeline runs: [Actions Tab](https://github.com/YOUR-USERNAME/forked-pipeline/actions)

## 📈 Code Coverage

Coverage reports are generated and uploaded as artifacts in each workflow run.
Download from the Actions tab → Workflow run → Artifacts section.

## 🐳 Docker Hub Integration

Your Docker images are automatically pushed to Docker Hub when you push to `main`:
- `your-username/first-pipeline:latest`
- `your-username/first-pipeline:COMMIT_SHA`

View at: `https://hub.docker.com/r/your-username/first-pipeline`

## 💬 Slack Notifications

Get notified in Slack when:
- ✅ Deployment succeeds
- ❌ Pipeline fails

## 🚀 Deployment

### Render
The pipeline automatically deploys to Render on push to `main` using the deploy hook.

Check deployment status at your Render dashboard.

## 📚 Pipeline Jobs```bash
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

## Gold checklist (what's added/required for gold level)

- Proper linting with `eslint` (run `npm run lint`).
- Comprehensive test suite with 10 tests and coverage (`npm test`, `npm run test:coverage`).
- Dockerfile hardened to run as non-root user and includes a `HEALTHCHECK`.
- `.dockerignore` and `.gitignore` added to reduce build context and avoid secrets.
- `SECURITY.md`, `CONTRIBUTING.md` and `.env.example` added.

Quick verification commands:

```bash
npm install
npm run lint
npm test
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
