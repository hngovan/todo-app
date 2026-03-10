# Todo App - Backend

The robust API layer for the Todo Project, built on top of NestJS.

## ✨ Features

- **RESTful API**: Structured endpoints bridging backend logic and database.
- **Authentication**: Solid JWT-based authentication using Passport.
- **Object Storage**: S3-compatible file uploads handled efficiently via MinIO integration.
- **Database Interaction**: Uses TypeORM for type-safe relational queries and migrations.
- **Validation**: Enforced strict input validation utilizing DTOs, `class-validator`, and `class-transformer`.
- **API Documentation**: Pre-configured Swagger UI for browsing docs and testing operations interactively.

## 🚀 Tech Stack

- **Framework**: NestJS
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: TypeORM
- **Storage**: MinIO (S3 Compatible) for file handling
- **Authentication**: Passport Strategy, JWT
- **Validation**: class-validator, class-transformer
- **Documentation**: Swagger UI

### From the Root Directory (Monorepo)

From the `todo-app` root directory, you can start the backend by navigating to it or using PNPM filters.

```bash
cd backend
pnpm install
pnpm start:dev
```

## 🔐 Environment Variables

Ensure you have a `.env` file mapping out parameters matching your local Docker configurations or external services. An example of required variables:

```dotenv
# Server
PORT=3000

# Database Connectivity
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=todo_app

# JWT & Session
JWT_SECRET=super_secret_key
JWT_EXPIRATION=1d

# MinIO (Storage)
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=admin
MINIO_SECRET_KEY=admin123
MINIO_BUCKET=todo-app
```

## 📜 Available Scripts

```bash
# Starts the NestJS application in watch mode
pnpm start:dev

# Compiles the application into the dist/ directory
pnpm build

# Runs the compiled production build
pnpm start:prod

# Runs ESLint against the codebase
pnpm lint

# Formats code utilizing Prettier
pnpm format
```

## 🐳 Docker Deployment

A `Dockerfile` is provided in this directory for containerization.

```bash
# Build the Docker image manually
docker build -t todo-backend .

# Run the image
docker run -p 3000:3000 --env-file .env todo-backend
```

*Note: For local development, using the `docker-compose.yml` located in the root repository is recommended to reliably orchestrate the database alongside the application.*

## 🗄️ Database Migrations (TypeORM)

This project uses TypeORM to manage schemas. Ensure your PostgreSQL instance is running before executing migrations.

```bash
# Generates a new migration file based on entity changes
pnpm migration:generate

# Applies all pending migrations to the database
pnpm migration:run

# Reverts the most recently applied migration
pnpm migration:revert
```

## 🧬 Models

The core business entities include:

- **User**: Represents a registered user. Holds credentials, profile data, and relations to their tasks.
- **Todo**: Represents a task. Includes title, description, completion status, due dates, priority, and optional attachments.

## 🛡️ Guards & Session Security

- **LocalAuthGuard**: Protects the `/auth/login` route. Validates raw email/password credentials utilizing Passport's Local Strategy.
- **JwtAuthGuard**: Protects virtually all other resources (Todos, Profile). Validates Bearer JWTs provided in the `Authorization` headers.

## 👥 Seed Users

*(If applicable in your setup, you can seed initial test data via SQL scripts run directly against PostgreSQL or by integrating a custom NestJS seeder module).*

## 📂 Project Structure

```text
src/
├── auth/           # Authentication endpoints, JWT Strategies, and Guards
├── common/         # Global Exceptions, Decorators, and Interceptors
├── config/         # Environment configurations
├── database/       # TypeORM configuration, Entities, and Migrations
├── minio/          # S3-compatible File Upload module logic
├── todos/          # Todo business logic, controllers, and services
├── users/          # User management and profiling
├── app.module.ts   # Root Module
└── main.ts         # Application Entry Point
```

## 📡 API Endpoints & Documentation

### Authentication

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/auth/register` | Instantiate a new account |
| `POST` | `/auth/login` | Authenticate and receive a JWT |
| `POST` | `/auth/refresh` | Swap a refresh token for a fresh access token |
| `GET` | `/auth/me` | Read current user profile |

### Todos

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/todos` | Fetch all tasks (supports query filtering) |
| `GET` | `/todos/:id` | Fetch one task |
| `POST` | `/todos` | Create a new task |
| `PATCH` | `/todos/:id` | Edit a task's details |
| `PATCH` | `/todos/:id/toggle` | Mark task as done/undone |
| `DELETE` | `/todos/:id` | Remove a task |
| `POST` | `/todos/:id/attachments` | Upload multi-part forms mapping to MinIO objects |

### 📖 Swagger API Docs

While the application is running, head over to `http://localhost:3000/api` to browse through the interactive documentation produced by `@nestjs/swagger`. This UI visualizes all endpoints, allowed payloads, validation schemas, and provides a built-in sandbox to make requests.
