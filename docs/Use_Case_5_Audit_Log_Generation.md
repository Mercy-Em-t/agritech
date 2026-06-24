# Use Case 5: Institutional Cryptographic Audit Log Generation

* **Actor:** Institutional Purchaser (Side B Demand)
* **Pre-conditions:** The buyer has secured an asset through a virtual cluster and requires proof of origin for a food safety audit.
* **Trigger:** The buyer clicks "Download Audit Trail" on the web dashboard.

#### Primary Success Path (Flow of Events)

1. **Request:** The web dashboard calls `GET /api/v1/audit/{asset_id}`.
2. **Aggregation:** The backend queries the `AssetLifecycleState` history and `LedgerJournal` for all events tied to the `asset_id`.
3. **Sequential Hashing:** The system verifies the SHA-256 hash chain of the event history to ensure no records were altered post-creation.
4. **Cryptographic Signing:** The final payload is signed using the platform's private RSA key.
5. **Delivery:** The payload is returned to the buyer as a downloadable, verifiable JSON document.

#### Alternate / Exception Paths

* **Exception 3A (Hash Chain Mismatch):** If the system detects a mismatch in the sequential hashing (indicating data corruption or tampering), it throws an `AUDIT_INTEGRITY_FAILURE` alert to system administrators and returns a 500 error to the buyer, halting the audit generation until the data anomaly is resolved.
