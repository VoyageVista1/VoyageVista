#! /usr/bin/env sh

set -e
set -x

docker compose up -d mailpit

cd backend/

uv sync
uv run alembic upgrade head
uv run python app/initial_data.py

cd ..
bun install

cd frontend/
bun run build

cd ../backend/
uv run fastapi dev
