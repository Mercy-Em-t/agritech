# CoinOS System Structure Charts (C4 Model)

Below is the structural breakdown of the CoinOS architecture, adhering to the C4 model (Context, Container, Component) to decompose the platform from a high-level bird's-eye view down to its primitive processing forms.

---

## 1. Context Diagram (Level 0)
**Scope:** The entire CoinOS Edge Orchestration Platform as a single entity interacting with external actors.

```mermaid
graph TD
    %% Actors
    C([Cultivator Node])
    B([Institutional Buyer])
    S([Spot Market Buyer])
    L([Logistics / 3PL Node])
    O([QA Oracle Node])
    F([Fiat Mobile Money Gateway])

    %% System
    COINOS[/"CoinOS Edge Orchestration Platform"\]

    %% Relationships
    C -->|Logs harvest intent offline| COINOS
    B -->|Places Q_Target bulk contracts| COINOS
    COINOS -->|Routes downgraded assets| S
    L -->|Transmits IoT telemetry| COINOS
    O -->|Cryptographically verifies grade| COINOS
    COINOS -->|Triggers instant settlements| F
```

---

## 2. Container Diagram (Level 1)
**Scope:** Zooms inside the CoinOS Platform to show the high-level technical containers (applications, databases, message brokers) and how data flows between them.

```mermaid
graph TD
    %% External
    Actors((External Actors))
    Fiat((Fiat Gateway API))

    %% Containers
    subgraph "CoinOS Edge Platform"
        UI[Web Dashboard Hub\nReact / Vite]
        MOBILE[Mobile Sync Edge\nReact Native / SQLite]
        API[API Orchestrator Gateway\nNode.js / Express]
        KAFKA[[Kafka Event Bus\nMessage Broker]]
        POSTGIS[(PostGIS Spatial DB\nPostgreSQL)]
        ESCROW[Escrow & Settlement Engine\nTypeScript Service]
        ML[Predictive ML Engine\nPython / Scikit-Learn]
    end

    %% Flow
    Actors -->|HTTP / REST| UI
    Actors -->|Offline/Online Sync| MOBILE
    UI -->|API Calls| API
    MOBILE -->|CRDT Payloads| API
    
    API -->|Reads/Writes Spatial Data| POSTGIS
    API -->|Emits Events| KAFKA
    
    KAFKA -->|Consumes Telemetry| ML
    ML -->|Emits Rerouting Events| KAFKA
    
    KAFKA -->|Consumes Verified Deliveries| ESCROW
    ESCROW -->|Updates Ledger Locks| POSTGIS
    ESCROW -->|Triggers Payouts| Fiat
```

---

## 3. Component Diagram (Level 2)
**Scope:** Zooms inside the **API Orchestrator Gateway** container to identify the specific micro-components and logic controllers driving the application.

```mermaid
graph TD
    %% Input/Output
    UI((Frontend Portals))
    DB[(PostGIS)]
    BUS[[Kafka Bus]]

    subgraph "API Orchestrator Gateway Container"
        ROUTER[REST / API Router]
        
        NODE_CTRL[Polymorphic Node Controller\nHandles Identity & Capabilities]
        CLUSTER_SRV[Proximity Matcher Service\nST_DWithin Spatial Logic]
        CRDT_SRV[CRDT Sync Engine\nVector Clock Reconciliation]
        SPOT_SRV[Spot Market Router\nCalculates Dynamic Glut Discounts]
    end

    %% Flow
    UI -->|Requests| ROUTER
    
    ROUTER -->|/nodes/register| NODE_CTRL
    ROUTER -->|/clusters/match| CLUSTER_SRV
    ROUTER -->|/sync/crdt| CRDT_SRV
    ROUTER -->|/spot-market| SPOT_SRV

    NODE_CTRL -->|Insert Geometry| DB
    CLUSTER_SRV -->|Spatial Queries| DB
    CRDT_SRV -->|Idempotent Writes| DB
    
    CRDT_SRV -->|Emits Data Ingested| BUS
    SPOT_SRV -->|Emits Market Purchase| BUS
```

---

## 4. Primitive Structure Chart (Level 3 Code Breakdown)
**Scope:** Zooms into the exact internal execution logic of a specific component. Here, we break down the **Predictive ML Engine** into its most primitive structural flow.

```mermaid
graph TD
    %% Execution Flow
    START((New Message\nReceived)) --> KAFKA_POLL
    
    subgraph "app.py (Event Loop)"
        KAFKA_POLL[consumer.poll] --> PARSE_PAYLOAD[Parse JSON\nTemp, Humidity, TTL]
    end
    
    subgraph "model.py (Scikit-Learn Brain)"
        PARSE_PAYLOAD --> MODEL_PREDICT[LinearRegression.predict]
        MODEL_PREDICT --> BOUND_LIMITS[Enforce Real-World\nNon-Negative Bounds]
        BOUND_LIMITS --> TTL_CALC[Calculate Projected TTL]
    end
    
    subgraph "Circuit Breaker Logic"
        TTL_CALC --> DECISION{Projected TTL < 24h?}
        DECISION -- Yes --> ALARM[Construct PROACTIVE_DOWNGRADE Payload]
        ALARM --> PRODUCER[producer.produce]
        DECISION -- No --> IGNORE[Continue Monitoring]
    end
```
