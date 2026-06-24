import { PrismaClient } from '@prisma/client';
import { Kafka } from 'kafkajs';

const prisma = new PrismaClient();
const kafka = new Kafka({ clientId: 'coinos-escrow-service', brokers: ['localhost:9092'] });
const consumer = kafka.consumer({ groupId: 'escrow-settlement-group' });
const producer = kafka.producer();

const EDGE_FEE_PERCENTAGE = 0.05; // 5% orchestration fee

export const startEscrowSettlementService = async () => {
  await consumer.connect();
  await producer.connect();
  // Listen for physical delivery verification events from the logistics nodes
  await consumer.subscribe({ topic: 'logistics.delivery.verified', fromBeginning: false });
  // Listen for smallholder requests for advance seedling credit
  await consumer.subscribe({ topic: 'financial.voucher.requested', fromBeginning: false });

  console.log('🏦 [EscrowService] Financial settlement engine online...');

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      if (!message.value) return;
      const event = JSON.parse(message.value.toString());

      if (topic === 'logistics.delivery.verified' && event.event_type === 'DELIVERED') {
        console.log(`[EscrowService] Delivery verified for Cluster ${event.cluster_id}. Initiating Settlement.`);
        await executeProportionalSettlement(event.cluster_id, event.total_payout_usd, event.target_quantity);
      }

      if (topic === 'financial.voucher.requested' && event.event_type === 'INPUT_CREDIT_REQUESTED') {
        await issueInputCreditVoucher(event.node_id, event.contract_id, event.requested_amount);
      }
    },
  });
};

async function executeProportionalSettlement(clusterId: string, pTotal: number, qTarget: number) {
  try {
    // Orchestration Fee Calculation
    const fEdge = pTotal * EDGE_FEE_PERCENTAGE;
    const distributablePool = pTotal - fEdge;

    // Fetch all nodes that contributed to this cluster and their respective quantities (qi)
    // Assuming a virtual cluster_contributions table exists mapping node_id to quantity
    const contributions = await prisma.$queryRaw<any[]>`
      SELECT node_id, quantity_kg as q_i 
      FROM cluster_contributions 
      WHERE cluster_id = ${clusterId}::uuid;
    `;

    // Atomic Ledger Updates
    await prisma.$transaction(async (tx) => {
      // 1. Log the Platform Edge Fee collection
      await tx.ledgerJournal.create({
        data: {
          node_id: 'SYSTEM_PLATFORM_NODE',
          transaction_type: 'EDGE_FEE_COLLECTED',
          amount: fEdge,
          idempotency_key: `FEE_${clusterId}`
        }
      });

      // 2. Execute the Proportional Settlement Formula for each node
      for (const node of contributions) {
        // Formula: P_i = (q_i / Q_Target) * (P_Total - F_Edge)
        const payout = (node.q_i / qTarget) * distributablePool;

        // Note: Real-world logic would also deduct any outstanding Input Credit Vouchers here.
        
        await tx.ledgerJournal.create({
          data: {
            node_id: node.node_id,
            transaction_type: 'SETTLEMENT_CREDIT',
            amount: payout,
            idempotency_key: `SETTLE_${clusterId}_${node.node_id}`
          }
        });

        console.log(`[EscrowService] Settled $${payout.toFixed(2)} to Node ${node.node_id}`);
      }
    });

    // 3. Emit settlement success to trigger M-Pesa Fiat off-boarding
    await producer.send({
      topic: 'financial.settlement.completed',
      messages: [{
        key: clusterId,
        value: JSON.stringify({
          event_type: 'SETTLEMENT_CLEARED',
          cluster_id: clusterId,
          timestamp: new Date().toISOString()
        })
      }]
    });

  } catch (error) {
    console.error('CRITICAL_SETTLEMENT_FAILURE:', error);
  }
}

async function issueInputCreditVoucher(nodeId: string, contractId: string, requestedAmount: number) {
  // Logic to issue up to 30% advance locked strictly to intra-network nursery nodes
  console.log(`[EscrowService] Issuing $${requestedAmount} Input Credit Voucher to Node ${nodeId}`);
  // ... ledger locking logic here
}
