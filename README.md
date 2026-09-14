# Full Stack FastAPI Template
[![Test Docker Compose](../../actions/workflows/test-docker-compose.yml/badge.svg)](../../actions/workflows/test-docker-compose.yml)
[![Test Backend](../../actions/workflows/test-backend.yml/badge.svg)](../../actions/workflows/test-backend.yml)
## Getting started
### Requirements

* [Bun](https://bun.sh/)
* [uv](https://docs.astral.sh/uv/) for Python package and environment management.

### Note this guide is made for Unix (mac/linux) NOT FOR WINDOWS
To get started I've made a start script in bash. Go into the root of the project and run this.
```bash
scripts/startup.sh
```
This script should take care of building the frontend, running the migrations and filling the database with initial data. It's just a collection of the manual commands found in [development.md](./development.md), [frontend.md](./frontend/README.md), [backend.md](./backend/README.md).

After that you can run the project with this command. Don't forget to install [uv](https://docs.astral.sh/uv/) 
```bash
cd backend/
uv run fastapi dev
```

You can now find the project running on http://localhost:8000/

If you have [docker](https://www.docker.com/) installed you can use Mailpit for local email recovery. It should already work with the entire project but it's not required to run the project.
```bash
docker compose up -d mailpit
```

The rest of the docs are from the template and probably ai generated but could be useful for more details.

## Technology Stack and Features

- ⚡ [**FastAPI**](https://fastapi.tiangolo.com) for the Python backend API.
  - 🧰 [SQLModel](https://sqlmodel.tiangolo.com) for the Python SQL database interactions (ORM).
  - 🔍 [Pydantic](https://docs.pydantic.dev), used by FastAPI, for the data validation and settings management.
  - 💾 [SQLite](https://www.sqlite.org) as the SQL database.
- 🚀 [React](https://react.dev) for the frontend.
  - 🧩 Built into the backend application and served by FastAPI on the same domain as the API.
  - 💃 Using TypeScript, hooks, [Vite](https://vitejs.dev), and other parts of a modern frontend stack.
  - 🎨 [Tailwind CSS](https://tailwindcss.com) and [shadcn/ui](https://ui.shadcn.com) for the frontend components.
  - 🤖 An automatically generated frontend client.
  - 🧪 [Playwright](https://playwright.dev) for end-to-end testing.
  - 🦇 Dark mode support.
- 🐋 [Docker Compose](https://www.docker.com) for local services and self-hosted deployment.
  - 📞 [Traefik](https://traefik.io) as a reverse proxy with automatic HTTPS.
- 🔒 Secure password hashing by default.
- 🔑 JWT (JSON Web Token) authentication.
- 📫 Email-based password recovery.
- ✉️ [React Email](https://react.email) for email templates.
- 📬 [Mailpit](https://mailpit.axllent.org) for local email testing during development.
- ✅ Tests with [Pytest](https://pytest.org).
- 🏭 CI (continuous integration) and CD (continuous deployment) based on GitHub Actions.


## Development

General development docs: [development.md](./development.md).

This includes the local FastAPI and Vite workflow, Docker Compose services, `.env` configuration, and more.

## Backend Development

Backend docs: [backend/README.md](./backend/README.md).

## Frontend Development

Frontend docs: [frontend/README.md](./frontend/README.md).

