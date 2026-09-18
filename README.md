# E-Commerce Order Management Backend (Phase 2)

This is Phase 2 of an E-Commerce Order Management System built with Node.js, Express, PostgreSQL, Prisma, and Redis.

## Setup Instructions

### E-Commerce Order Management Backend

A production-ready E-Commerce backend built using Node.js, Express, PostgreSQL, Prisma, and Redis.

## Features (Phase 1, 2, 3)
- **Role-based Workflows**: Customer, Vendor, and Admin roles via header simulation (`x-user-id`, `x-role`).
- **Product Management**: Vendor products with Redis caching.
- **Cart System**: Fully Redis-backed cart memory.
- **Order Processing**: Distributed vendor order items.
- **Analytics**: Admin overview and vendor performance tracking, cached via Redis.
- **Performance & Security**: Helmet, CORS, Rate Limiting, request size limits.
- **API Quality**: Standardized Error catalog, Swagger documentation, Health & Metrics APIs.
- **Testing**: Jest unit testing and Supertest integration tests.
- **Docker Ready**: Fully containerized environment with Healthchecks and restart policies.

## Architecture Documentation
See the `docs/` folder for diagrams:
- [ER Diagram](./docs/ER-Diagram.md)
- [System Design](./docs/System-Design.md)
- [Request Flow](./docs/Request-Flow.md)

## Setup & Local Development

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Docker Environment**
   Start the database and cache:
   ```bash
   docker-compose up -d
   ```

3. **Environment Setup**
   Ensure `.env` matches the services running.
   ```bash
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ecommerce?schema=public"
   REDIS_HOST="localhost"
   REDIS_PORT="6380"
   PORT="3000"
   NODE_ENV="development"
   ```

4. **Database Migration & Seeding**
   ```bash
   npx prisma migrate dev
   
   # Large Seed (5000+ products, 20000+ orders)
   npm run seed:large
   
   # Small Seed (50 products, 100 orders)
   npm run seed:small
   ```

5. **Start Server**
   ```bash
   npm run dev
   ```

## Testing
Run the automated test suites:
```bash
npm run test
npm run test:coverage
```

## API Documentation
Once the server is running, visit:
`http://localhost:3000/api-docs`

A Postman collection is also provided in `postman_collection.json`.
- **Cache & Cart Storage**: Redis (ioredis)
- **Validation**: Zod
- **Logging**: Pino

## API Usage
Refer to the provided `postman_collection.json` to test all APIs.
**Important**: Simulation of users is handled through headers:
```http
x-user-id: 1
x-role: CUSTOMER # or VENDOR, ADMIN
```
