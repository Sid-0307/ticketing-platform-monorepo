# Dynamic Pricing Ticketing Platform

A real-time event ticketing platform with dynamic pricing based on demand, inventory, and time-to-event factors. Built with Next.js, NestJS, PostgreSQL, and Redis.

## Prerequisites

- Node.js 18+
- Docker & Docker Compose
- pnpm 9.0.0

## Installation

1. **Clone and install dependencies**

```bash
git clone <repository-url>
cd ticketing-platform-monorepo
pnpm install
```

2. **Configure environment variables**

```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Build the applications**

```bash
pnpm build
```

4. **Start with Docker**

```bash
docker-compose build
docker-compose up -d
```

5. **Access the application**

- Frontend: http://localhost:3000
- API: http://localhost:3001

## Environment Variables

### Root `.env`

```properties
# Database
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password
POSTGRES_DB=Ticketing

# Redis
REDIS_URL=redis://redis:6379

# Ports
API_PORT=3001
WEB_PORT=3000
NODE_ENV=production

# API URLs
API_URL=http://api:3001
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### API `.env` (apps/api/.env)

```properties
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/Ticketing"
PORT=3001

# Dynamic Pricing Weights
TIME_WEIGHT=0.3
DEMAND_WEIGHT=0.4
INVENTORY_WEIGHT=0.3

# Redis
REDIS_URL="redis://localhost:6379"
```

## Running Tests

```bash
# Run all tests
pnpm test

# Run tests for specific package
pnpm --filter @repo/api test
pnpm --filter web test
```

## Development

```bash
# Start all services in dev mode
pnpm dev

# Start specific service
pnpm --filter @repo/api dev
pnpm --filter web dev

# Build specific package
pnpm --filter @repo/api build
```

## Docker Commands

```bash
# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f api
docker-compose logs -f web

# Stop services
docker-compose down

# Rebuild and restart
pnpm build
docker-compose build
docker-compose up -d

# Access Redis
docker exec -it ticketing-redis redis-cli
```

## Features

- **Dynamic Pricing Algorithm**: Real-time price adjustments based on:
  - Time until event (urgency pricing)
  - Current demand (recent bookings)
  - Remaining inventory (scarcity pricing)
- **Concurrency Control**: Optimistic locking with Redis-based caching
- **Real-time Updates**: Redis cache invalidation on bookings
- **Monorepo Architecture**: Shared types and database schema
- **Docker Support**: One-command deployment

## API Endpoints

### Events

- `GET /events` - List all events with current pricing
- `GET /events/:id` - Get event details with pricing breakdown
- `GET /events/:id/pricing` - Get detailed pricing calculation

### Bookings

- `POST /bookings` - Create new booking
- `GET /bookings` - List all bookings

## Troubleshooting

**Containers won't start:**

```bash
docker-compose down -v
pnpm build
docker-compose build --no-cache
docker-compose up -d
```

**Port conflicts:**

- Ensure ports 3000, 3001, 5432, 6379 are available
- Modify port mappings in docker-compose.yml if needed

**Database connection issues:**

- Check PostgreSQL is healthy: `docker-compose ps`
- Verify DATABASE_URL in .env files

## License

MIT
