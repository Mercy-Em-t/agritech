# CoinOS Core Orchestration Edge Engine API

```yaml
openapi: 3.0.3
info:
  title: CoinOS Core Orchestration Edge Engine API
  version: 1.2.0-RELEASE
paths:
  /api/v1/nodes/register:
    post:
      summary: Register Polymorphic Node Identity & Geospatial Footprint
      description: Persists node geometry profiles inside PostGIS and initializes capabilities.
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - legal_name
                - geospatial_footprint
                - wallet_address
              properties:
                legal_name:
                  type: string
                geospatial_footprint:
                  type: object
                  description: Standard GeoJSON Polygon geometry mapping EPSG:4326.
                capabilities:
                  type: object
                  properties:
                    can_cultivate_crops:
                      type: boolean
                    can_provide_logistics:
                      type: boolean
                wallet_address:
                  type: string
      responses:
        '201':
          description: Polymorphic Node successfully established.

  /api/v1/telemetry/transit:
    post:
      summary: Ingest Real-Time Environmental IoT Data Stream
      description: Streams vehicle conditions to update perishability multipliers and dynamic asset TTL.
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - asset_id
                - temperature_c
                - humidity_percentage
              properties:
                asset_id:
                  type: string
                temperature_c:
                  type: number
                humidity_percentage:
                  type: number
      responses:
        '200':
          description: Telemetry log ingested; asset degradation re-evaluated.

  /api/v1/sync/crdt:
    post:
      summary: Reconcile Offline Ingestion Sets (Commutative G-Set)
      description: Flushes offline queue items safely using unique operation IDs to prevent sync duplication errors.
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - node_id
                - offline_g_set
              properties:
                node_id:
                  type: string
                offline_g_set:
                  type: array
                  items:
                    type: object
      responses:
        '200':
          description: Commutative synchronization reconciliation completed cleanly.
```
