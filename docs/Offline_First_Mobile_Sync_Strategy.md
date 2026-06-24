# Offline-First Mobile Sync Strategy (FR-1.1)

## Objective
To ensure that Cultivator Nodes can log future harvests, report crop quality, and request logistics even when completely disconnected from cellular networks.

## Architecture

We utilize an **Event-Sourced Sync Queue** on the mobile client.

### 1. Local Schema (WatermelonDB/SQLite)

The local device maintains an `Outbox` table.

```json
{
  "outbox_id": "uuid",
  "event_type": "string",
  "payload": "jsonb",
  "created_at": "timestamp",
  "sync_status": "PENDING | IN_FLIGHT | SYNCED | FAILED",
  "retry_count": 0
}
```

### 2. The Interaction Flow

1. **User Action:** Farmer hits "Log Harvest".
2. **Local Commit:** UI optimistic update occurs. The app immediately inserts an event into the `Outbox` with `sync_status = PENDING`.
3. **Background Worker:** A headless task monitors the React Native `NetInfo` module.
4. **Network Detected:** When connection is restored, the worker queries all `PENDING` records.
5. **Batching:** It batches the payloads to minimize radio usage and POSTs to `/api/v1/sync`.
6. **Reconciliation:** The server responds with `202 Accepted`. The local DB updates `sync_status = SYNCED` and eventually purges old records.

### 3. Conflict Resolution
Since all server-side architecture uses event-sourcing and `idempotency_key` (which is the local `outbox_id`), if a mobile client syncs the same payload twice due to a dropped acknowledgment, the Kafka broker will discard the duplicate based on the idempotency key.
