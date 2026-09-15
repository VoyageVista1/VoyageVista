#! /usr/bin/env sh

set -e
set -x

# Setup the env and the JWT secret token
cp .env.sample .env
SECRET_KEY="$(python3 -c 'import secrets; print(secrets.token_urlsafe(32))')"
sed -i.bak "s|^SECRET_KEY=.*|SECRET_KEY=${SECRET_KEY}|" .env
rm -f .env.bak
cd backend/

uv sync
uv run alembic upgrade head
uv run python app/initial_data.py

cd ..
bun install

cd frontend/
bun run build

