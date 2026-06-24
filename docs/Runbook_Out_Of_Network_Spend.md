# Out-of-Network Spend Attempt Boundaries (Exception 2-4A)

## Trigger Condition
A Cultivator Node has received an Escrow-Backed Input Credit Voucher, which is strictly designed to only be spendable at authorized Nursery Nodes for high-quality seedlings or fertilizer. The Cultivator attempts to transfer the voucher to an unauthorized node or cash it out to their fiat M-Pesa wallet.

## Automated Response Protocol
1. **Transaction Block:** The Ledger Service validates the recipient's `capability_flags` during the transaction request. If `can_produce_seedlings` or `can_manufacture_compost` is false, the transaction is hard-blocked at the DB level.
2. **Event Emission:** A `CREDIT_VOUCHER_SPEND_VIOLATION` event is emitted to the Kafka bus.
3. **UI Feedback:** The mobile application intercepts this error and displays a clear message: *"This Input Credit Voucher can only be used at verified Nursery or Fertilizer nodes. It cannot be converted to cash."*
4. **Audit Logging:** The failed transaction attempt is logged into the append-only LedgerJournal with a `FAILED_VIOLATION` status for future system audits.
