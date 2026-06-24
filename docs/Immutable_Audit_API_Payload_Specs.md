# Immutable Audit API Payload Specs (FR-2.1)

## Overview
Institutional buyers (Persona B) require strict tracking of food origins. This document specifies the cryptographic audit log structure exposed by the Edge Engine.

## Specification

The system maintains an append-only audit trail for every asset. The `/api/v1/audit/{asset_id}` endpoint returns a cryptographically signed payload.

### Payload Structure
```json
{
  "asset_id": "uuid",
  "audit_trail": [
    {
      "timestamp": "2024-01-10T08:00:00Z",
      "action": "HARVEST_LOGGED",
      "node_id": "producer-uuid",
      "gps_polygon": "GeoJSON",
      "hash": "sha256-hash-of-previous-entry-and-current-data"
    },
    {
      "timestamp": "2024-01-10T14:30:00Z",
      "action": "LOGISTICS_PICKUP_VERIFIED",
      "node_id": "3pl-uuid",
      "gps_point": "GeoJSON",
      "hash": "sha256-hash..."
    }
  ],
  "verification_signature": "rsa-signature-from-platform-private-key"
}
```

## Security Guarantees
- The `hash` field guarantees the sequential integrity of the events.
- The `verification_signature` allows corporate buyers to prove that the data originated directly from the CoinOS platform and was not tampered with.
