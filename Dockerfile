# --- STAGE 1: Build TypeScript to JavaScript ---
FROM node:18-alpine AS builder

WORKDIR /usr/src/app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source and compile
COPY . .
RUN npm run build

# --- STAGE 2: Production Container ---
FROM node:18-alpine AS production

WORKDIR /usr/src/app

# Copy only production dependencies and compiled code
COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /usr/src/app/dist ./dist

# Start the optimized JS runtime
CMD ["node", "dist/index.js"]
