# AES-256 Encryption & Privacy Compliance Guidelines (SR-2)

## Overview
To protect fragmented cultivators, sensitive data like geospatial polygons, identities, and ledger balances must be encrypted at rest in the PostgreSQL database.

## Implementation Standard

### 1. Database-Level Encryption (pgcrypto)
We use the PostgreSQL `pgcrypto` extension to encrypt fields directly in the database.

```sql
-- Example encryption function used by Prisma raw queries
PGP_SYM_ENCRYPT('Sensitive Data', 'secure-encryption-key-from-env', 'cipher-algo=aes256')
```

### 2. Application-Level Encryption
For highly sensitive fields (like KYC documents), encryption happens in the Node.js layer before touching the ORM.

```typescript
import crypto from 'crypto';

const algorithm = 'aes-256-gcm';
const key = process.env.ENCRYPTION_KEY;

export function encryptPayload(text: string) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, Buffer.from(key, 'hex'), iv);
  // ... encryption logic
}
```

## Key Management
- Keys must be rotated every 90 days.
- Local development uses a mock `.env` key.
- Production uses AWS KMS or Google Cloud KMS.
