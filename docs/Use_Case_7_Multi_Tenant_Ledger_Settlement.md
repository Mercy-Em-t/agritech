# Use Case 7: Multi-Tenant Ledger Settlement & Edge Fee Deduction

* **Actor:** The Edge Engine
* **Pre-conditions:** A 3PL Node scans a QR code confirming drop-off at the Institutional Buyer's facility, emitting a `DELIVERED` event.
* **Trigger:** The `AssetLifecycleState` transitions to `DELIVERED`.

#### Primary Success Path (Flow of Events)

1. **Escrow Unlock:** The Edge Engine verifies the delivery and triggers the Escrow Service to unlock the fiat funds associated with the `Cluster_ID`.
2. **Fee Deduction:** The system deducts the platform's orchestration fee ($F_{Edge}$) from the total gross price ($P_{Total}$). This is written as an append-only entry in the `LedgerJournal`.
3. **Proportional Distribution Calculation:** For each node in the cluster, the system applies the formula:  
   $P_i = (q_i / Q_{Target}) \times (P_{Total} - F_{Edge})$
4. **Credit Voucher Repayment Check:** For each node, the system checks if they have outstanding Input Credit Vouchers.
   - If yes: The voucher amount is deducted from $P_i$ and burned.
   - If no: The full $P_i$ is queued for payout.
5. **Ledger Settlement:** The calculated payouts are written as `SETTLEMENT_CREDIT` entries into the respective `LedgerJournal` accounts.
6. **Notification:** Nodes are notified that their final balances are ready for M-Pesa off-boarding.
