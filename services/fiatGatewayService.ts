import { Kafka } from 'kafkajs';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();
const kafka = new Kafka({ clientId: 'coinos-fiat-gateway', brokers: ['localhost:9092'] });
const consumer = kafka.consumer({ groupId: 'fiat-offboarding-group' });
const producer = kafka.producer();

// Mocked M-Pesa B2C Payment API Configuration
const MPESA_API_URL = 'https://sandbox.safaricom.co.ke/mpesa/b2c/v1/paymentrequest';
const MPESA_AUTH_TOKEN = 'mock-bearer-token-8842';

export const startFiatGatewayService = async () => {
  await consumer.connect();
  await producer.connect();
  
  // Listen for completed internal settlement events
  await consumer.subscribe({ topic: 'financial.settlement.completed', fromBeginning: false });

  console.log('💸 [FiatGateway] Automated Fiat Off-Boarding Integration Online...');

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      if (!message.value) return;
      const event = JSON.parse(message.value.toString());

      if (topic === 'financial.settlement.completed') {
        console.log(`[FiatGateway] Intercepted Settlement for Cluster ${event.cluster_id}. Initiating Fiat Disbursement...`);
        await executeFiatDisbursement(event.cluster_id);
      }
    },
  });
};

async function executeFiatDisbursement(clusterId: string) {
  try {
    // 1. Fetch all pending settlement credits for the specific cluster from our append-only ledger
    const pendingSettlements = await prisma.$queryRaw<any[]>`
      SELECT l.id, l.node_id, l.amount, n.mobile_money_number 
      FROM ledger_journal l
      JOIN nodes n ON l.node_id = n.node_id
      WHERE 
        l.idempotency_key LIKE ${`SETTLE_${clusterId}_%`}
        AND l.transaction_type = 'SETTLEMENT_CREDIT'
        AND l.status = 'PENDING';
    `;

    if (pendingSettlements.length === 0) {
      console.log(`[FiatGateway] No pending fiat disbursements found for Cluster ${clusterId}.`);
      return;
    }

    // 2. Process each payout via the external Mobile Money API
    for (const payout of pendingSettlements) {
      try {
        console.log(`[FiatGateway] Initiating M-Pesa B2C Transfer of $${payout.amount} to Node ${payout.node_id} (${payout.mobile_money_number})`);
        
        // Construct the strict B2C API Payload
        const apiPayload = {
          InitiatorName: "CoinOS_API_User",
          SecurityCredential: "encrypted_credential_mock",
          CommandID: "BusinessPayment",
          Amount: payout.amount,
          PartyA: "600000", // CoinOS Shortcode
          PartyB: payout.mobile_money_number, // Cultivator's Mobile Number
          Remarks: `Yield Payout for Cluster ${clusterId}`,
          QueueTimeOutURL: "https://api.coinos.network/mpesa/timeout",
          ResultURL: "https://api.coinos.network/mpesa/result",
          Occasion: "Payout"
        };

        // Simulate external API call
        // const response = await axios.post(MPESA_API_URL, apiPayload, { headers: { Authorization: `Bearer ${MPESA_AUTH_TOKEN}` } });
        
        // Mocking successful response
        const isSuccess = true; 

        if (isSuccess) {
          // 3. Mark the internal ledger as COMPLETED (Fiat Disbursed)
          await prisma.$executeRaw`
            UPDATE ledger_journal 
            SET status = 'FIAT_DISBURSED', updated_at = NOW()
            WHERE id = ${payout.id}::uuid;
          `;
          
          console.log(`✅ [FiatGateway] Successfully disbursed $${payout.amount} to Node ${payout.node_id}. Ledger locked.`);
        }

      } catch (transferError) {
        console.error(`🚨 [FiatGateway] M-Pesa API Failure for Node ${payout.node_id}:`, transferError);
        // Do not update ledger status; allows retry logic to sweep it later
      }
    }

  } catch (error) {
    console.error('CRITICAL_FIAT_GATEWAY_FAILURE:', error);
  }
}
