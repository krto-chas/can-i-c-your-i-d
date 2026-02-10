FROM node:18.16-alpine

# Create app directory
WORKDIR /app

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
