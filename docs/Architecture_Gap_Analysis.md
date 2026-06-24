# Architecture Gap Analysis

This document outlines the differences between our current Proof of Concept (PoC) codebase and the **Final Engineering Tech Stack Blueprint** defined in `System_Sequence_Charts.md`.

## 1. Message Broker
- **Blueprint Spec:** Apache Kafka or RabbitMQ.
- **Current State:** We are using an in-memory Node.js `EventEmitter` (`packages/event-bus/index.ts`).
- **Gap Resolution:** We must migrate the central `EventBus` singleton to produce and consume messages via a managed Kafka cluster.

## 2. Geospatial Database Engine
- **Blueprint Spec:** PostgreSQL with PostGIS extensions for spatial indices (`ST_Contains`, `ST_Buffer`).
- **Current State:** We are using PostgreSQL via Prisma, but the `geospatial_footprint` is currently stored as a flat `JsonB` field. The proximity logic is simulated in TypeScript.
- **Gap Resolution:** We must write raw Prisma SQL migrations to convert the JSON arrays into PostGIS `GEOMETRY(Polygon, 4326)` columns and replace the TypeScript logic with spatial SQL queries.

## 3. State Machine Management
- **Blueprint Spec:** XState or native database-level transaction state locks.
- **Current State:** We have a custom-built TypeScript `EventStateMachine` class.
- **Gap Resolution:** We should refactor `EventStateMachine` to use the `xstate` library, which provides mathematically rigorous, visualization-friendly finite state machines.

## 4. Distributed Ledger Layer
- **Blueprint Spec:** Isolated, ACID-compliant ledger built on an append-only architecture.
- **Current State:** Financial state is represented as flat balances inside the `Node` Prisma table.
- **Gap Resolution:** We must extract the `ledger` fields out of the `Node` table into a dedicated `LedgerJournal` table where every transaction is an append-only immutable row, and balances are derived dynamically.
