#!/usr/bin/env bash

set -e
set -x

FASTAPI_ENV=development uv run coverage run -m pytest tests/
uv run coverage report
uv run coverage html --title "${@-coverage}"
