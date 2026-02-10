# Changelog

All notable changes to this project are documented in this file.

## [Unreleased] - 2026-02-10

### Added
- Added `GET /secret` endpoint in `index.js` for the secret challenge objective.
- Added `docker-compose.yml` for local container run with health check on `/status`.
- Added `.dockerignore` to reduce Docker build context.

### Changed
- Renamed source files to JavaScript extension format used by npm scripts:
  - `index` -> `index.js`
  - `test` -> `test.js`
- Updated `index.js` to only start the server when run directly (`require.main === module`), which makes it import-safe for tests.
- Updated `test.js` to verify both `GET /status` and `GET /secret` in one CI-friendly test run.
- Replaced `.github/workflows/pipeline.yml` scaffold with full CI/CD workflow:
  - install dependencies
  - run tests
  - build Docker image
  - Trivy security scan
  - deploy webhook on push to `main` (when `DEPLOY_WEBHOOK_URL` secret is set)

### Verified (Current State)
- `package.json` scripts now match file names:
  - `start`: `node index.js`
  - `test`: `node test.js`
- Local test run passes after installing dependencies.

### Remaining Work
- Configure `DEPLOY_WEBHOOK_URL` in GitHub repository secrets for live deployment.
- (Optional) Add CI badge and deployment URL in README.
