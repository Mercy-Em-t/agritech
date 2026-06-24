import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';

// Import our core engines
import { topologyDirectory } from '../../services/topology-directory/index';
import { intakeApi } from '../../services/intake-api/index';
import { NodeIdentity, IntakeDraft } from '../../packages/types/index';

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;

// --- 1. TOPOLOGY ONBOARDING ENDPOINT ---
app.post('/api/nodes/register', (req, res) => {
  try {
    const nodeData: NodeIdentity = req.body;
    
    // Simulate basic validation
    if (!nodeData.node_id || !nodeData.identity) {
      return res.status(400).json({ error: 'Invalid Node schema' });
    }

    topologyDirectory.registerNode(nodeData);
    return res.status(201).json({ message: 'Node registered to ecosystem', node_id: nodeData.node_id });
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// --- 2. OFFLINE EDGE INTAKE SYNC ---
app.post('/api/intake/sync', async (req, res) => {
  try {
    const drafts: IntakeDraft[] = req.body.drafts;
    
    if (!drafts || !Array.isArray(drafts)) {
      return res.status(400).json({ error: 'Payload must contain a drafts array' });
    }

    // Pass the drafts straight to the Intake engine which fires the ASSET_INTENT_LOGGED events
    await intakeApi.receiveOfflineSync(drafts);
    
    return res.status(202).json({ message: `Successfully queued ${drafts.length} drafts for intake validation and event dispatch.` });
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// --- 3. ESCROW SECURED WEBHOOK (From Institutional Buyers) ---
import { eventBus } from '../../packages/event-bus/index';

app.post('/api/webhooks/escrow', (req, res) => {
  try {
    const { contract_id, buyer_node_id, supplier_node_id, total_value } = req.body;

    if (!contract_id || !total_value) {
      return res.status(400).json({ error: 'Missing escrow contract details' });
    }

    // Fire the event. The EscrowEngine will catch this and issue the Micro-Loan voucher automatically.
    eventBus.emitEvent('ESCROW_SECURED', {
      contract_id,
      buyer_node_id,
      supplier_node_id,
      total_value
    });

    return res.status(200).json({ message: 'Escrow Secured event fired. Upstream credit allocation in progress.' });
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// --- START SERVER ---
app.listen(PORT, () => {
  console.log(`[API Gateway] Orchestration Server running on http://localhost:${PORT}`);
});
