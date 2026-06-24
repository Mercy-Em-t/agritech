# --- STAGE 1: Build TypeScript to JavaScript ---
FROM node:18-alpine AS builder

WORKDIR /usr/src/app

# Copy source and install dependencies
COPY . .
RUN npm ci

# Compile
RUN npm run build

# --- STAGE 2: Production Container ---
FROM node:18-alpine AS production

WORKDIR /usr/src/app

# Copy workspace files and package.json
COPY . .
RUN npm ci --omit=dev

COPY --from=builder /usr/src/app/dist ./dist

# Start the optimized JS runtime
CMD ["node", "dist/index.js"]
