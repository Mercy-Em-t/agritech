# Use Case 6: Dynamic Logistics Bounty Adjustment (Surge Pricing)

* **Actor:** The Edge Engine, 3PL Node
* **Pre-conditions:** An asset's state is `TRANSIT_REQUIRED`, and a baseline bounty has been broadcasted to nearby 3PL nodes.
* **Trigger:** The broadcast timeout window expires (e.g., 15 minutes) with zero 3PL nodes accepting the job.

#### Primary Success Path (Flow of Events)

1. **Timeout Detection:** The Kafka consumer managing the dispatch topic detects the timeout.
2. **Surge Calculation:** The Edge Engine retrieves the asset's remaining biological Time-to-Live (TTL) and the current Platform Edge Fee reserve balance. It calculates a new surge multiplier (e.g., 1.5x).
3. **Bounty Update:** The job's payload is updated with the new `bounty_usd` and re-broadcasted to a slightly wider geospatial radius.
4. **Push Notification:** 3PL drivers receive a "High Priority Surge Route" push notification.
5. **Acceptance:** A driver accepts the job, locking the route and stopping the surge timer.

#### Alternate / Exception Paths

* **Exception 2A (Reserve Depletion):** If the Platform Edge Fee reserve is insufficient to cover the surge multiplier, the system refuses to increase the bounty to avoid platform insolvency. It instead triggers the **Market-Clearing Circuit Breaker** to downgrade the asset to a local processor (Tier 2), eliminating the need for long-haul transport.
