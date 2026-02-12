FROM node:18-alpine

# Create app directory
WORKDIR /app

# Upgrade system packages to patch OS-level CVEs
RUN apk update && apk upgrade --no-cache

# Install dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Remove npm and its vulnerable bundled dependencies (tar, semver, glob, etc.)
# The app only needs the node runtime, not npm
RUN rm -rf /usr/local/lib/node_modules/npm /usr/local/bin/npm /usr/local/bin/npx

# Copy source
COPY . .

# Ensure non-root user (official node image includes `node` user)
RUN chown -R node:node /app
USER node

EXPOSE 3000

# Lightweight healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget -qO- http://localhost:3000/health || exit 1

# Run node directly instead of npm start (npm was removed)
CMD ["node", "index.js"]
