# Use Case 4: Offline-First Yield Synchronization Recovery

* **Actor:** Cultivator Node (Side A Producer)
* **Pre-conditions:** The mobile app has logged an asset harvest locally in its SQLite `Outbox` table while offline.
* **Trigger:** The mobile device regains a cellular connection.

#### Primary Success Path (Flow of Events)

1. **Network Detection:** The React Native background worker detects a stable connection via `NetInfo`.
2. **Queue Read:** The app reads all pending records from the local `Outbox`.
3. **Batch Transmission:** The app sends a batched JSON payload to `POST /api/v1/sync`.
4. **Server Ingestion:** The Edge Gateway writes the events directly into the Kafka topic.
5. **Idempotency Check:** The Kafka consumer reads the batch and verifies the `outbox_id` against processed records. Finding no matches, it commits the harvest logs to PostgreSQL.
6. **Reconciliation Response:** The server responds to the mobile app with a `202 Accepted` and an array of successfully processed `outbox_id`s.
7. **Local Cleanup:** The mobile app marks the local SQLite records as `SYNCED` and clears them from the UI queue.

#### Alternate / Exception Paths

* **Exception 4A (Connection Drops Mid-Sync):** If the network drops before the server responds, the mobile app retains the `PENDING` status. When connection is restored, it re-transmits. The server's idempotency check catches the duplicate `outbox_id`, discards the duplicate payload, and returns a success response to clear the local queue.
