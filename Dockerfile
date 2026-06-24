# --- STAGE 1: Build TypeScript to JavaScript ---
FROM node:18-alpine AS builder

WORKDIR /usr/src/app

# Copy source and install all dependencies
COPY . .
RUN npm install

# Compile
RUN npx prisma generate
RUN npm run build

# Remove devDependencies to shrink the image size
RUN npm prune --omit=dev

# --- STAGE 2: Production Container ---
FROM node:18-alpine AS production

WORKDIR /usr/src/app

# Copy pruned node_modules and compiled code from builder
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/package*.json ./

# Start the optimized JS runtime
CMD ["node", "dist/index.js"]
