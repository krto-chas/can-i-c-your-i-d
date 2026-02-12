# ── Stage 1: Build ──
# npm is available here for installing dependencies
FROM node:18-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

# ── Stage 2: Production ──
# Only node runtime, no npm (smaller image, fewer vulnerabilities)
FROM node:18-alpine

WORKDIR /app

# Upgrade system packages to patch OS-level CVEs
RUN apk update && apk upgrade --no-cache

# Remove npm from the production image (not needed at runtime)
# This eliminates all of npm's bundled vulnerable packages (tar, semver, glob, etc.)
RUN rm -rf /usr/local/lib/node_modules/npm /usr/local/bin/npm /usr/local/bin/npx

# Copy only the installed node_modules from build stage
COPY --from=build /app/node_modules ./node_modules

# Copy application source
COPY . .

# Run as non-root user
RUN chown -R node:node /app
USER node

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget -qO- http://localhost:3000/health || exit 1

CMD ["node", "index.js"]
