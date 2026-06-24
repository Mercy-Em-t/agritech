# Turn-by-Turn Mobile Routing Optimization (FR-3.1)

## Overview
Independent 3PL drivers require dynamic routing payloads that adjust for specific agricultural constraints (e.g., avoiding bumpy roads for fragile crops).

## Payload Structure
The mobile app receives route coordinates via Kafka push events when a job is accepted.

```json
{
  "job_id": "uuid",
  "asset_type": "Fragile Seedlings",
  "route_constraints": {
    "avoid_unpaved": true,
    "max_speed_kmh": 60,
    "max_transit_time_hours": 4
  },
  "waypoints": [
    { "lat": 1.23, "lon": 3.45, "type": "PICKUP" },
    { "lat": 1.45, "lon": 3.67, "type": "DROPOFF" }
  ]
}
```

## Client Implementation
The React Native app feeds these constraints into the `Mapbox` or `Google Maps` Navigation SDKs using their respective `avoid` parameters to calculate the final polyline.
