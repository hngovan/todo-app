#!/bin/sh
set -e

echo "⏳ Running database migrations..."
pnpm migration:run:prod

echo "🚀 Starting NestJS server..."
exec node dist/main
