# M-Pesa / Mobile Money Integration Protocol (IR-1)

## Overview
Cultivators often operate outside the traditional banking system. CoinOS integrates with local Mobile Money APIs (like Safaricom's M-Pesa) for instantaneous fiat off-boarding.

## Protocol Flow

1. **Edge Fee Deduction:** The system settles the multi-tenant ledger and calculates the final `$P_i` payout.
2. **Fiat Conversion Request:** The Cultivator requests withdrawal via the app.
3. **API Dispatch:** The system backend calls the M-Pesa B2C (Business to Customer) API.

### Payload Structure
```json
{
  "InitiatorName": "CoinOS_API_User",
  "SecurityCredential": "<Encrypted_Password>",
  "CommandID": "BusinessPayment",
  "Amount": 150.00,
  "PartyA": "123456", // CoinOS Shortcode
  "PartyB": "254712345678", // Farmer Phone Number
  "Remarks": "Harvest Settlement",
  "QueueTimeOutURL": "https://api.coinos.io/webhooks/mpesa/timeout",
  "ResultURL": "https://api.coinos.io/webhooks/mpesa/result",
  "Occasion": "Settlement"
}
```

## Idempotency
All requests map the CoinOS `LedgerJournal` ID to the M-Pesa `TransactionID` to ensure payments are never processed twice.
