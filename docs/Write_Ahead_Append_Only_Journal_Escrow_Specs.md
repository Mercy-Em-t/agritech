# Write-Ahead Append-Only Journal Escrow Specs (SR-1)

## Overview
To prevent fraud and race conditions in financial ledger updates, the CoinOS database uses Event Sourcing instead of updating a raw balance integer. Every financial action creates an immutable log entry.

## Prisma Schema Implementation
```prisma
model LedgerJournal {
  entry_id               String   @id @default(uuid()) @db.Uuid
  node_id                String   @db.Uuid
  transaction_type       String   // e.g., 'CREDIT_MINTED', 'EDGE_FEE_DEDUCTED'
  amount                 Float    // Positive for credits, negative for debits
  currency               String   @default("USD")
  created_at             DateTime @default(now())
  idempotency_key        String   @unique
}
```

## Calculation Logic
Balances are calculated on the fly or cached via materialized views. 
To get a user's balance:
```sql
SELECT SUM(amount) FROM LedgerJournal WHERE node_id = 'user_uuid' AND currency = 'USD';
```

## Security Constraints
- `UPDATE` and `DELETE` commands are strictly forbidden on the `LedgerJournal` table via PostgreSQL Roles and Row-Level Security (RLS).
- If a mistake happens, a compensatory transaction (a reversing entry) must be appended.
