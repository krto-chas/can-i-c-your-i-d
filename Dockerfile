FROM node:18-alpine

# Create app directory
WORKDIR /app

# Upgrade system packages to patch OS-level CVEs
RUN apk update && apk upgrade --no-cache

# Upgrade npm's own bundled packages to fix vulnerabilities in global npm
# CVE-2026-24842, CVE-2026-23950, CVE-2026-23745: tar (HIGH)
# CVE-2022-25883: semver (HIGH)
# CVE-2024-29415: ip - NO FIX AVAILABLE YET
RUN npm install -g npm@10

# Install dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy source
COPY . .

# Ensure non-root user (official node image includes `node` user)
RUN chown -R node:node /app
USER node

EXPOSE 3000

# Lightweight healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget -qO- http://localhost:3000/health || exit 1

CMD ["npm", "start"]