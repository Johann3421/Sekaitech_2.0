#!/bin/sh
set -e

echo "──────────────────────────────────────────"
echo "  Hyper-Logic – Container Startup"
echo "──────────────────────────────────────────"

# Wait a moment to ensure the DB healthcheck has fully passed
# (depends_on: condition: service_healthy already handles this,
#  but a short sleep adds extra safety on slow hosts)
sleep 2

echo "▶ Running database migrations..."
node ./node_modules/prisma/build/index.js migrate deploy

echo "▶ Starting Next.js server..."
exec node server.js
