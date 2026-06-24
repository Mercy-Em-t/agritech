# CoinOS: System Actors & API Endpoints Matrix

To fully map the boundaries of the CoinOS Edge Engine, we must define the exact **System Actors** (the physical entities interacting with the platform) and the **API Endpoints** (the digital reception gates that process their actions).

---

## 👥 System Actors

These are the primary polymorphic nodes interacting within the circular economy:

| Actor Profile | Primary Role | System Responsibility |
| :--- | :--- | :--- |
| **Cultivator Node (Producer)** | Smallholder Farmer / Co-Op | Logs crop intent offline, registers spatial boundaries (`ST_GeomFromGeoJSON`), and forms spontaneous proximity clusters to meet bulk volume targets. |
| **Institutional Buyer (B2B)** | FMCG Corp / Exporter | Places high-volume target contracts ($Q_{Target}$), locks Escrow fiat, and demands strict Quality Assurance (Tier 1). |
| **Logistics Node (3PL)** | Transporter / Cold-Chain | Moves physical assets and transmits live IoT telemetry (Temperature/Humidity) continuously to the Kafka Event Bus. |
| **QA Oracle Node** | Agronomist / IoT Spectrometer | Cryptographically signs the biological quality and moisture level of crops before delivery is finalized, preventing fraud. |
| **Spot Market Buyer (B2C)** | Local Restaurant / Consumer | Absorbs downgraded or excess yields that trigger the Circuit Breaker, utilizing dynamic price-drop gluts. |
| **The Edge Engine (System)** | Autonomous Orchestrator | Calculates proportional settlement ($P_i$), enforces Market Circuit Breakers, and predicts ML biological routing. |

---

## 📡 Core API Endpoints

The system relies on high-throughput, decoupled REST/GraphQL endpoints to feed the Kafka message bus and the PostGIS spatial layer.

### 1. Identity & Spatial Routing (Node Management)

| Endpoint | Method | Actor | Description |
| :--- | :--- | :--- | :--- |
| `/api/v1/nodes/register` | `POST` | Cultivator, Buyer | Ingests basic node data and a GeoJSON polygon to establish the node's `geospatial_footprint` inside PostGIS. |
| `/api/v1/clusters/match` | `GET` | System / Cultivator | Executes `ST_DWithin` queries to find proximal nodes within a 50km radius and proposes a Virtual Co-Op cluster. |
| `/api/v1/sync/crdt` | `POST` | Cultivator (Mobile) | Flushes offline event logs (harvest intents) using Vector Clocks to reconcile the database without sync collisions. |

### 2. Validation & Quality Assurance (The Trust Layer)

| Endpoint | Method | Actor | Description |
| :--- | :--- | :--- | :--- |
| `/api/v1/telemetry/transit` | `POST` | Logistics Node | High-frequency endpoint receiving temperature/humidity JSON payloads to dynamically alter the asset's Time-to-Live (TTL). |
| `/api/v1/oracle/verify` | `POST` | QA Oracle | Receives an RSA-signed payload assigning a strict grade (e.g., Tier 1 or Tier 2). Verifies the cryptographic signature before updating the DB. |

### 3. Financial Settlement & B2C Market (Liquidity Layer)

| Endpoint | Method | Actor | Description |
| :--- | :--- | :--- | :--- |
| `/api/v1/escrow/settle` | `POST` | System (Internal) | Triggered upon delivery confirmation. Calculates the 5% Edge Fee and splits the remaining Fiat proportionally ($P_i$) across the cluster. |
| `/api/v1/spot-market/listings` | `GET` | Spot Market Buyer | Aggregates downgraded assets within a specified radius, automatically applying a discount penalty multiplier based on local oversupply. |
| `/api/v1/spot-market/purchase` | `POST` | Spot Market Buyer | Locks a spot market asset, clearing the internal ledger and triggering the Fiat Gateway for instant disbursement to the farmer. |

> [!IMPORTANT]
> **Internal Event Bus:** Note that while these are the public-facing REST APIs, the true power of CoinOS lies in the internal **Kafka Topics** (e.g., `market.routing.cascade`, `logistics.delivery.verified`) that these endpoints asynchronously emit to. The endpoints act as gates; Kafka acts as the nervous system.
