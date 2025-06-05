# WatchMe - Cinema Online Backend

Backend service for the WatchMe cinema catalog application, built with NestJS.

## Features

- User authentication with JWT
- Movie catalog integration with TMDb API
- Favorites and movie view tracking
- Redis caching
- Event tracking system
- PostgreSQL database with Prisma ORM

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL
- Redis
- Docker (optional)

## Environment Setup

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Update the environment variables in `.env` with your configuration:
- Database connection
- JWT secret
- Redis configuration
- TMDb API credentials
- AWS SQS settings (optional)

## Installation

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev
```

## Running the Application

```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

## API Documentation

Once the application is running, visit:
- Swagger UI: http://localhost:3000/api
- API Docs: http://localhost:3000/api-docs

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## Docker Support

```bash
# Build and run with Docker Compose
docker-compose up -d
```

## License

[MIT licensed](LICENSE)