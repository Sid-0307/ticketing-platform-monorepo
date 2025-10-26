# Design Document

## Pricing Algorithm Implementation

The dynamic pricing system uses a weighted multi-factor approach to adjust ticket prices in real-time. The algorithm considers three primary factors: time urgency, current demand, and inventory scarcity. Each factor contributes a percentage adjustment, weighted by configurable constants (TIME_WEIGHT=0.3, DEMAND_WEIGHT=0.4, INVENTORY_WEIGHT=0.3).

**Time-based pricing** increases prices as events approach, with adjustments ranging from 0% (14+ days out) to 50% (within 24 hours). **Demand-based pricing** monitors bookings in the last hour, applying up to 50% increases when 15+ tickets are sold recently. **Inventory-based pricing** creates scarcity value, adding up to 40% when less than 10% of tickets remain. The final price is constrained between configurable minimum and maximum bounds to prevent extreme pricing.

This approach balances revenue optimization with customer fairness, allowing event organizers to capture maximum value during high-demand periods while maintaining accessible pricing during slower periods.

## Concurrency Solution

To handle concurrent booking requests safely, I implemented a two-layer strategy combining database-level optimistic locking with Redis-based result caching. The booking service uses atomic database operations with row-level locking to prevent overselling tickets. When a booking is created, the system performs a SELECT FOR UPDATE, increments the booked_tickets counter, and validates inventory in a single transaction.

Redis caching provides a 15-second TTL for pricing calculations, reducing database load while ensuring prices reflect recent activity. Cache keys include the event ID and current booked_tickets count, automatically invalidating when inventory changes. This prevents stale pricing while maintaining sub-50ms response times for repeated requests.

For race conditions during high-traffic periods, the database transaction will fail if tickets are unavailable, returning a clear error to the user. This pessimistic locking approach trades some performance for absolute consistency, ensuring no double-bookings occur.

## Monorepo Architecture

I chose a pnpm workspace monorepo to share code efficiently between frontend and backend while maintaining clear boundaries. The structure separates concerns into three packages: `apps/api` (NestJS backend), `apps/web` (Next.js frontend), and `packages/database` (shared Drizzle ORM schema and types).

This architecture provides several benefits: type safety across the entire stack through shared TypeScript definitions, single source of truth for database schema, simplified dependency management, and coordinated builds through Turbo. The database package exports both the schema and a configured database client, ensuring both API and database migrations use identical type definitions.

The trade-off is increased build complexity and Docker image sizes, as each service needs access to the full monorepo. However, the benefits of shared types and reduced code duplication outweigh these costs for a project of this scope.

## Trade-offs and Limitations

**Caching strategy**: The 15-second pricing cache improves performance but may show slightly outdated prices during flash sales. A shorter TTL would increase accuracy at the cost of database load.

**Demand calculation**: Currently limited to the last hour of bookings. A more sophisticated approach using rolling windows or exponential decay would better capture demand trends but adds computational complexity.

**Horizontal scaling**: The current architecture works well for single-instance deployments but would require Redis Pub/Sub or database triggers for cache invalidation across multiple API instances.

## Future Improvements

With more time, I would implement: real-time WebSocket updates for live pricing changes on the frontend; more sophisticated demand forecasting using historical patterns; dynamic weight adjustment based on event type and historical performance; comprehensive integration tests for concurrent booking scenarios; monitoring and observability with detailed pricing decision logging; and A/B testing framework to optimize pricing weights based on conversion rates and revenue metrics.
