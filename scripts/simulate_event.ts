import { eventBus } from '../packages/event-bus/index';
import { topologyDirectory } from '../services/topology-directory/index';
import { cascadeEngine } from '../services/cascade-engine/index';
import { clusterAggregator } from '../services/cluster-aggregator/index';
import { eventStateMachine } from '../services/event-state-machine/index';
import { logisticsEngine } from '../services/logistics-engine/index';
import { 
  AssetLifecycleState, NodeIdentity, FleetType, FleetActiveStatus 
} from '../packages/types/index';

console.log('--- INITIALIZING SYSTEM BOOTSTRAP ---\n');

// Helper to create a base node
const createNode = (id: string, name: string): NodeIdentity => ({
  node_id: id,
  identity: { legal_name: name, verified: true, created_at: new Date().toISOString() },
  geospatial_footprint: { type: 'Polygon', coordinates: [] },
  capabilities: { can_produce_seedlings: false, can_cultivate_crops: false, can_process_extracts: false, can_manufacture_compost: false, can_provide_logistics: false },
  ledger: { wallet_address: '0x123', available_balance: 0, escrow_locked_balance: 0, input_credit_vouchers: 0 }
});

// 1. Register Cultivator Node
const coffeeNode = createNode('node-001-coffee', 'Highland Coffee Farm');
coffeeNode.capabilities.can_cultivate_crops = true;
topologyDirectory.registerNode(coffeeNode);

// 2. Register Logistics Nodes
const logNode1 = createNode('trans-001-fast', 'Rapid Cold Transports Inc.');
logNode1.capabilities.can_provide_logistics = true;
logNode1.logistics_profile = {
  fleet_type: FleetType.Cold_Chain, max_capacity_kg: 5000,
  base_location: { long: 0, lat: 0 }, operational_radius_km: 100, active_status: FleetActiveStatus.Idle,
  pricing_model: 'Dynamic_Bid' // The hybrid pricing requested
};
logisticsEngine.registerLogisticsNode(logNode1);

const logNode2 = createNode('trans-002-bulk', 'Valley Bulk Haulers');
logNode2.capabilities.can_provide_logistics = true;
logNode2.logistics_profile = {
  fleet_type: FleetType.Flatbed_Bulk, max_capacity_kg: 10000,
  base_location: { long: 0, lat: 0 }, operational_radius_km: 200, active_status: FleetActiveStatus.Idle,
  pricing_model: 'Platform_Locked'
};
logisticsEngine.registerLogisticsNode(logNode2);

console.log('\n--- SYSTEM BOOTSTRAP COMPLETE ---\n');

// 3. Simulate: Harvest Ready -> triggers Dispatch Required
setTimeout(() => {
  console.log('\n>>> TRIGGER: Perishable Asset Harvested - Requires Immediate Cold Chain Logistics');
  eventBus.emitEvent('LOGISTICS_DISPATCH_REQUIRED', {
    asset_id: 'ASSET-PREMIUM-AVO',
    origin: { node_id: 'node-001-coffee', coords: [0, 0] },
    destination: { node_id: 'node-009-buyer', coords: [1, 1] },
    required_fleet_type: FleetType.Cold_Chain,
    total_weight_kg: 2000,
    max_transit_time_hours: 12 // Spoilage critical in 12 hours
  });
}, 1000);

// 4. Simulate: Offline Edge-Client Intake Sync
setTimeout(async () => {
  console.log('\n>>> TRIGGER: Offline Edge Client Syncs Batch Intake');
  
  // Importing intakeApi here to avoid top-level async execution blocks
  const { intakeApi } = await import('../services/intake-api/index');
  const { CommodityType, GradeTier } = await import('../packages/types/index');

  const mockDrafts = [
    {
      draft_id: 'draft-001',
      origin_node_id: 'node-001-coffee',
      crop_type: CommodityType.Avocado,
      estimated_weight_kg: 500,
      self_reported_grade: GradeTier.A_Premium,
      photo_proof_url: 'https://example.com/avo-proof.jpg'
    },
    {
      draft_id: 'draft-002',
      origin_node_id: 'node-001-coffee',
      crop_type: CommodityType.Organic_Waste,
      estimated_weight_kg: 1200,
      self_reported_grade: GradeTier.C_Biomass
      // Intentionally missing photo proof to trigger AI flag
    }
  ];

  await intakeApi.receiveOfflineSync(mockDrafts as any);
}, 2000);

// 5. Simulate: Escrow Secured -> Micro-Loan Checkmate
setTimeout(async () => {
  console.log('\n>>> TRIGGER: Side B Buyer Locks Capital in Escrow');
  // Need to import the engine to run its constructor and register listeners
  await import('../services/escrow-engine/index');

  eventBus.emitEvent('ESCROW_SECURED', {
    contract_id: 'CONTRACT-99X-AVO',
    buyer_node_id: 'node-009-buyer',
    supplier_node_id: 'node-001-coffee',
    total_value: 50000 // $50,000 contract
  });
}, 3000);

// 6. Simulate: Market-Clearing Circuit Breaker
setTimeout(() => {
  console.log('\n>>> TRIGGER: Critical Glut Detected (> 35% surplus)');
  eventBus.emitEvent('MARKET_CIRCUIT_BREAKER_ACTIVATED', {
    commodity: 'Avocado',
    impacted_zone_id: 'ZONE_EA_02',
    surplus_tonnage: 45.2,
    action_required: {
      force_downgrade_to_tier: 2,
      eligible_processor_capabilities: ['can_process_extracts'],
      logistics_bounty_multiplier: 1.5
    }
  });
}, 4000);
