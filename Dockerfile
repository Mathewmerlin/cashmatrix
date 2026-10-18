# Stage 1: Build the Vite frontend dashboard
FROM node:20-alpine AS frontend-builder
WORKDIR /app

# Copy dependency configs
COPY package.json ./

# Clean npm cache and install dependencies safely without lockfile corruption issues
RUN npm cache clean --force
RUN npm install --legacy-peer-deps

# Copy rest of the project source files
COPY . .
RUN npm run build

# Stage 2: Production runtime environment
FROM node:20-alpine AS runner
WORKDIR /app

COPY --from=frontend-builder /app/dist ./dist
COPY --from=frontend-builder /app/package.json ./package.json

EXPOSE 3000

CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "3000"]
