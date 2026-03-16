# Todo App

A full-stack Todo application built with React (Vite), NestJS, TypeORM, PostgreSQL, and MinIO (S3), structured as a PNPM Monorepo.

## 📚 Documentation

- [Frontend Guide](./frontend/README.md)
- [Backend Guide](./backend/README.md)

## 🚀 Tech Stack

| Layer | Technology |
| --- | --- |
| **Frontend** | React 19, Vite, Tailwind CSS v4 |
| **UI Components** | shadcn/ui, Radix UI primitives |
| **State Management** | Zustand, React Context API |
| **Forms & Validation** | react-hook-form, Zod |
| **Backend** | NestJS, TypeScript |
| **ORM** | TypeORM |
| **Database** | PostgreSQL |
| **Storage** | MinIO (S3 Compatible) |
| **Authentication** | JWT (passport-jwt) |
| **API Docs** | Swagger / OpenAPI |

## 📂 Project Structure

```text
todo-app/
├── package.json         # Root workspace scripts
├── pnpm-workspace.yaml  # Monorepo configuration
├── docker-compose.yml   # Local infra (Postgres, pgAdmin, MinIO)
├── backend/             # NestJS API
└── frontend/            # React Vite Client
```

## ⚙️ Environment Setup

1. Make sure you have **Node.js >= 18** and **pnpm >= 8** installed.
2. Install dependencies for all workspaces from the root:

   ```bash
   pnpm install
   ```

3. Generate the environment files for both frontend and backend automatically:

   ```bash
   pnpm env:setup
   ```

   *(Update the generated `.env` files in `backend/` and `frontend/` if you need custom credentials).*

## 🐳 Quick Start

The easiest way to initialize the required services (PostgreSQL, pgAdmin, and MinIO) is using Docker Compose.

```bash
# Start with Docker (recommended)
docker compose up -d

# Start with Docker Compose Watch (Frontend auto-sync)
# This will sync local changes to the container and rebuild on dependency changes
docker compose watch

# Stop all services
docker compose down

# Stop and remove volumes (⚠️ WARNING: Destroys all database & storage data!)
docker compose down -v

# Start both the frontend and backend simultaneously from the root directory
pnpm dev

# Or start manually
cd backend && pnpm install && pnpm start:dev
cd frontend && pnpm install && pnpm run dev
```

## 🌐 Access

Once the applications and containers are up and running, you can access the services here:

- **Frontend App**: <http://localhost:5173>
- **Backend API**: <http://localhost:3000>
- **Swagger Docs**: <http://localhost:3000/api>
- **MinIO Console**: <http://localhost:9001> (Web UI for object storage)
- **pgAdmin**: <http://localhost:5050> (Database management tool)

## 📡 API Overview

The backend exposes a comprehensive REST API. You can view the full documentation, test endpoints, and view schemas via the Swagger UI available at `http://localhost:3000/api`.

### Authentication

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/auth/register` | Register a new user |
| `POST` | `/auth/login` | Login with email and password |
| `GET` | `/auth/me` | Get current user profile (Requires JWT) |
| `POST` | `/auth/refresh` | Refresh an expired access token using a refresh token |

### Todos

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/todos` | Get all todos for current user (Query parameters: filter, search, sort) |
| `GET` | `/todos/:id` | Get a single todo by ID |
| `POST` | `/todos` | Create a new todo |
| `PATCH` | `/todos/:id` | Update an existing todo |
| `PATCH` | `/todos/:id/toggle` | Toggle the completed status of a todo |
| `DELETE` | `/todos/:id` | Delete a todo |
| `POST` | `/todos/:id/attachments` | Upload file attachments for a todo (max 5 files, up to 10 MB each - stored in MinIO) |

For a complete and interactive description of all API endpoints and schemas, please refer to the [Full API Documentation in the Backend Guide](./backend/README.md#%F0%9F%93%A1-swagger-api-docs).

## 💿 Seed Data & Database Migrations

Drizzle/TypeORM migrations are used to maintain the database schema.
To run migrations and apply the schema to your PostgreSQL instance:

```bash
cd backend
pnpm migration:run
```

## 🔄 Formatting & Linting

This project uses **Husky** and **lint-staged**. When you commit your code, these tools will automatically format your code and fix linting errors.

You can also run these checks manually depending on your context:

### From the Root Directory (Monorepo)

```bash
# Lints both frontend and backend code concurrently.
pnpm lint

# Formats both frontend and backend code concurrently.
pnpm format
```

### From the Frontend Directory (`/frontend`)

```bash
# Checks for React/TypeScript linting errors.
pnpm lint

# Automatically fixes fixable ESLint errors.
pnpm lint:fix

# Checks Prettier formatting.
pnpm format

# Automatically applies Prettier formatting.
pnpm format:fix
```

### From the Backend Directory (`/backend`)

```bash
# Checks and fixes generic ESLint errors using NestJS config.
pnpm lint

# Automatically applies Prettier formatting to all .ts files.
pnpm format
```

## 🚢 Production Deployment

To build the application for production:

```bash
# From the root directory, this builds both frontend and backend
pnpm build
```

- **Backend**: Can be containerized via the included Dockerfile or run natively via Node (`node dist/main`).
- **Frontend**: The dist folder generated in `frontend/dist` can be served by Nginx, Vercel, Netlify, or AWS S3/CloudFront.

## 📄 License

MIT
