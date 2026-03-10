FROM node:20-alpine

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Install dependencies first (layer cache)
COPY package.json pnpm-lock.yaml ./
RUN pnpm install

# Copy source
COPY . .

EXPOSE 5173

# Vite must listen on 0.0.0.0 to be reachable outside container
CMD ["pnpm", "dev", "--host", "0.0.0.0"]
