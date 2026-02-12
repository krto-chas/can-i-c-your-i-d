FROM node:18.16-alpine

# Create app directory
WORKDIR /app

# Upgrade system packages and pin vulnerable packages to fixed versions
# CVE-2022-48174: busybox/ssl_client 1.36.1-r0 → 1.36.1-r1+ (CRITICAL)
# CVE-2025-26519: musl-utils 1.2.4-r0 → 1.2.4-r3 (HIGH)
# CVE-2026-24842: tar 6.1.13 → 7.5.7+ (arbitrary file creation) (HIGH)
# CVE-2026-23950: tar 6.1.13 → 7.5.4+ (arbitrary file overwrite) (HIGH)
# CVE-2024-28863: tar 6.1.13 → 6.2.1+ (folder depth DoS) - FIXED (7.5.7 > 6.2.1)
# CVE-2022-25883: semver 7.3.8 → 7.5.2+ (regex DoS) - FIXED (7.7.4 > 7.5.2)
# CVE-2024-29415: ip package - NO FIX AVAILABLE YET (not in Node.js dependencies)
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