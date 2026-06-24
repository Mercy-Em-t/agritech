# Documentation Task List

This file tracks all upcoming and ongoing documentation efforts for the CoinOS platform. We will append new documentation requirements here as the project evolves.

- [ ] API Swagger Documentation
- [ ] Frontend Developer Onboarding Guide
- [ ] Offline-First Mobile Sync Strategy Docs (FR-1.1)
- [ ] Immutable Audit API Payload Specs (FR-2.1)
- [ ] Turn-by-Turn Mobile Routing Optimization Docs (FR-3.1)
- [ ] M-Pesa / Mobile Money Integration Protocol (IR-1)
- [ ] AES-256 Encryption & Privacy Compliance Guidelines (SR-2)
- [ ] Write-Ahead Append-Only Journal Escrow Specs (SR-1)

## Exception Flow Runbooks
- [ ] Low Local Density Fallback Strategy (Exception 1-3A)
- [ ] Asset Degradation Re-Calculation Protocol (Exception 1-4A)
- [ ] Escrow Invalidation & Fraud Prevention Rules (Exception 2-2A)
- [ ] Out-of-Network Spend Attempt Boundaries (Exception 2-4A)

## Suggested Additional Use Cases (To Be Written)
- [ ] Use Case 4: Offline-First Yield Synchronization Recovery
- [ ] Use Case 5: Institutional Cryptographic Audit Log Generation
- [ ] Use Case 6: Dynamic Logistics Bounty Adjustment (Surge Pricing)
- [ ] Use Case 7: Multi-Tenant Ledger Settlement & Edge Fee Deduction

## Tech Stack Migration Tasks (To Reach Production Spec)
- [ ] Migrate `eventBus` to Apache Kafka or RabbitMQ
- [ ] Implement PostGIS `GEOMETRY` fields and spatial queries (`ST_Contains`) via Prisma raw SQL
- [ ] Refactor `EventStateMachine` to use the `xstate` library
- [ ] Extract Node `ledger` into an isolated, append-only Event Sourcing journal service
