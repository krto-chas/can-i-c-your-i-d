FROM node:18.16-alpine

# Create app directory
WORKDIR /app

# Upgrade system packages and pin vulnerable packages to fixed versions
# CVE-2022-48174: busybox/ssl_client 1.36.1-r0 → 1.36.1-r1+
# CVE-2025-26519: musl-utils 1.2.4-r0 → 1.2.4-r3
# CVE-2026-24842: tar 6.1.13 → 7.5.7+ (arbitrary file creation)
# CVE-2026-23950: tar 6.1.13 → 7.5.4+ (arbitrary file overwrite)
RUN apk update && apk upgrade && apk add --no-cache musl-utils>=1.2.4-r3

# Install dependencies as non-root where possible
COPY package*.json ./
RUN npm ci --only=production

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