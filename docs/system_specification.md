# CoinOS: Comprehensive System Specification (v1.2.0-RELEASE)

## 1. Introduction
**Project Name:** CoinOS Edge Orchestration Platform
**Objective:** A decentralized, event-driven orchestration engine designed to eliminate the agricultural "middleman." It uses PostGIS spatial clustering, Kafka message brokering, Machine Learning decay prediction, and instant fiat settlement to create a frictionless, zero-waste agricultural supply chain.

## 2. Master Documentation Index
Instead of duplicating technical specifications, this document acts as the Master Root. Please refer to the specific architectural documents below for deep dives into individual subsystems:

- **[System Structure Charts (C4 Models)](file:///C:/Users/LIZBETH/.gemini/antigravity-ide/brain/887e475e-70a0-4703-8f2e-dfadd020d29b/system_structure_charts.md):** The comprehensive Level 0 to Level 3 structural layout.
- **[System Actors & Endpoints](file:///C:/Users/LIZBETH/.gemini/antigravity-ide/brain/887e475e-70a0-4703-8f2e-dfadd020d29b/system_actors_and_endpoints.md):** The physical mapping of Cultivators, Buyers, Logistics, and Oracles.
- **[API Swagger Specification](file:///C:/Users/LIZBETH/Desktop/agritech/docs/API_Swagger_Documentation.md):** OpenAPI 3.0.3 definitions for the core HTTP boundaries.
- **[Plain-English Executive Summary](file:///C:/Users/LIZBETH/Desktop/agritech/docs/sys):** The business-value proposition of the platform.

---

## 3. Core Software Subsystems

### 3.1. The Unified UI Portal Hub (`apps/web`)
A single, lightweight React/Vite web application implementing `react-router-dom` to dynamically serve dedicated, role-based interfaces based on the active actor.
- **Cultivator Edge Simulator:** Offline-first form logging crop intent.
- **Buyer Portal:** High-volume ($Q_{Target}$) contract deployment and Escrow funding.
- **QA Oracle Terminal:** High-security cryptographic signature terminal.
- **System Orchestrator:** The global dashboard visualizing clusters, events, and ledgers in real-time.

### 3.2. Proximity & Identity Routing (`services/clusterService.ts`)
- **Technology:** PostGIS (`ST_GeomFromGeoJSON`, `ST_DWithin`).
- **Function:** Aggregates micro-yields from smallholder farmers within a strict 50km radius into massive "Virtual Co-Ops" to fulfill institutional bulk orders.

### 3.3. Offline Edge Synchronization (`apps/mobile-edge/SyncEngine.ts`)
- **Technology:** CRDTs (Conflict-Free Replicated Data Types) & Vector Clocks.
- **Function:** Allows edge nodes (farmers) to log intent data without 4G connectivity. Employs Last-Writer-Wins (LWW) resolution to deterministically merge datasets when returning online without write-collisions.

### 3.4. Predictive Biological Routing (`services/ml-engine/`)
- **Technology:** Python, Scikit-Learn, Kafka-Python.
- **Function:** Ingests live truck telemetry (Temperature/Humidity). A Linear Regression model predicts the exact hour the asset will breach premium quality thresholds. If breach is imminent, it fires a `PROACTIVE_ML_DOWNGRADE` event to instantly reroute the truck to a closer Spot Market.

### 3.5. Escrow & Fiat Settlement (`services/escrowService.ts`, `services/fiatGatewayService.ts`)
- **Technology:** Append-only SQL Ledger (`ledger_journal`), M-Pesa Mock API.
- **Function:** Calculates the platform's 5% Edge Fee, calculates the proportional payout ($P_i$) to the farmers, locks the ledger, and triggers instant mobile money transfers upon QA Oracle verification.

---

## 4. Infrastructure & Deployment
- **Containerization:** The backend infrastructure is strictly defined in `docker-compose.yml`.
- **Services Running:**
  - `coinos_spatial_db` (PostGIS 15)
  - `coinos_zookeeper` (Confluent 7.3.0)
  - `coinos_event_bus` (Kafka Broker - Port 9092)
  - `coinos_ml_engine` (Python Predictor)
- **Automated Testing:** The platform guarantees stability via integration suites located in `tests/v1_2_release.test.ts`.

---

## 5. Security Invariants
1. **Idempotency Guarantee:** Network drops cannot result in duplicate payouts or CRDT syncs. All financial and sync endpoints utilize strictly checked unique IDs (e.g. `crdt_id`, `idempotency_key`).
2. **State Isolation:** The Escrow ledger and Fiat API network calls are explicitly separated. If the external bank API fails, the internal database transaction is never prematurely committed.
