# CHANGELOG: CoinOS Edge Engine

## [1.0.0-rc.1] - Sprint 1 Release Candidate

### Added
- **Polymorphic Node Registration API:** `nodeController.ts` intercepts batched mobile payloads and persists strictly to PostGIS using raw `ST_GeomFromGeoJSON` bounds.
- **Proximity Cluster Matching Service:** `clusterService.ts` executes autonomous event-driven routing, capturing initialization events from Kafka and mathematically associating neighboring coordinates with Sub-300ms PostGIS queries.
- **Escrow & Settlement Engine:** `escrowService.ts` guarantees multi-tenant payout logic ($P_i$) using immutable, append-only `ledger_journal` transactions, locking 5% edge orchestration fees completely autonomously.
- **Chaos & Resiliency Suite:** `tests/chaosSuite.test.ts` validates deterministic FSM Circuit Breaker cascades and extreme PostGIS load bounds (10,000 parallel connections).

### Infrastructure Updates
- Scaffolded decoupled `docker-compose.yml` leveraging Kafka, Zookeeper, and PostGIS inside isolated `coinos_network`.
- Fully documented Swagger API Contracts and Exception Rule-Sets.

### Security Enhancements
- Deployed LangGraph-based AST Verification Gate to prevent unsafe memory mocks and state manipulations before deployment.
