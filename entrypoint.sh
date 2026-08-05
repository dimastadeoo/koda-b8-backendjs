#!/bin/sh
set -e

echo "Running database migrations..."
# Pastikan DATABASE_URL di sini mengarah ke service 'db' (misal: postgres://user:pass@db:5432/mydb?sslmode=disable)
migrate -path /app/migrations -database "$DATABASE_URL" up

echo "Migrations completed. Starting application..."
exec "$@"