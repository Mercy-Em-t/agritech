// --- ENUMS & BASE TYPES ---
export enum CommodityType {
  Coffee = 'Coffee',
  Avocado = 'Avocado',
  Seedlings = 'Seedlings',
  Organic_Waste = 'Organic_Waste'
}

export enum GradeTier {
  A_Premium = 'A_Premium',
  B_Processing = 'B_Processing',
  C_Biomass = 'C_Biomass'
}

// --- NEW SCHEMAS FROM USER ---

export interface NodeIdentity {
  node_id: string;
  identity: {
    legal_name: string;
    verified: boolean;
    created_at: string;
  };
  geospatial_footprint: {
    type: 'Polygon';
    coordinates: number[][][];
  };
  capabilities: {
    can_produce_seedlings: boolean;
    can_cultivate_crops: boolean;
    can_process_extracts: boolean;
    can_manufacture_compost: boolean;
    can_provide_logistics: boolean;
  };
  ledger: {
    wallet_address: string;
    available_balance: number;
    escrow_locked_balance: number;
    input_credit_vouchers: number;
  };
  logistics_profile?: LogisticsProfile; // Keep for logistics engine
}

export interface Asset {
  asset_id: string;
  origin_node_id: string;
  profile: {
    commodity: string;
    initial_grade: string;
    quantity_kg: number;
    harvest_at: string;
    spoilage_at: string;
  };
  routing: {
    current_tier: number;
    active_buyer_id: string | null;
    cluster_id: string | null;
  };
}

// --- LOGISTICS & ROUTING SCHEMA ---
export enum FleetType {
  Cold_Chain = 'Cold_Chain',
  Flatbed_Bulk = 'Flatbed_Bulk',
  Organic_Waste_Tipper = 'Organic_Waste_Tipper'
}

export enum FleetActiveStatus {
  Idle = 'Idle',
  In_Transit = 'In_Transit',
  Maintenance = 'Maintenance'
}

export interface LogisticsProfile {
  fleet_type: FleetType;
  max_capacity_kg: number;
  base_location: { long: number; lat: number };
  operational_radius_km: number;
  active_status: FleetActiveStatus;
  pricing_model: 'Dynamic_Bid' | 'Platform_Locked';
}

// --- CLUSTER SCHEMA ---
export interface VirtualCooperative {
  clusterId: string;
  memberNodes: { node_id: string; contribution_kg: number }[];
  consolidatedYieldKg: number;
  targetBuyerId?: string;
  activeContractEscrow?: number;
}

// --- INTAKE INTERFACE SCHEMA ---
export interface IntakeDraft {
  draft_id: string;
  origin_node_id: string;
  crop_type: CommodityType;
  estimated_weight_kg: number;
  self_reported_grade: GradeTier;
  photo_proof_url?: string;
}

export interface AssetIntentLoggedPayload {
  asset_id: string;
  origin_node_id: string;
  asset_contract: Asset;
  ai_verification_status: 'PENDING' | 'VERIFIED' | 'FLAGGED';
}

// --- ESCROW & MICRO-LOAN SCHEMA ---
export interface CreditVoucher {
  voucher_id: string;
  issued_to_node_id: string;
  amount: number;
  locked_contract_id: string;
  usable_at_capabilities: string[];
}

export interface LogisticsPickupRequestedPayload {
  consignment_id: string;
  pickup_center: [number, number];
  dropoff_center: [number, number];
  constraints: {
    requires_refrigeration: boolean;
    max_transit_hours: number;
  };
  payout_allocation: number;
}

export interface MarketCircuitBreakerActivatedPayload {
  commodity: string;
  impacted_zone_id: string;
  surplus_tonnage: number;
  action_required: {
    force_downgrade_to_tier: number;
    eligible_processor_capabilities: string[];
    logistics_bounty_multiplier: number;
  };
}

export interface EscrowSecuredPayload {
  contract_id: string;
  buyer_node_id: string;
  supplier_node_id: string;
  total_value: number;
}

export interface LogisticsDispatchRequiredPayload {
  asset_id: string;
  origin: { node_id: string, coords: [number, number] };
  destination: { node_id: string, coords: [number, number] };
  required_fleet_type: FleetType;
  total_weight_kg: number;
  max_transit_time_hours: number;
}

export interface AssetPrimaryMarketMissedPayload {
  asset_id: string;
  missed_buyer_id: string;
  current_tier: number;
  time_since_harvest_hours: number;
}

export enum AssetLifecycleState {
  INTENT_LOGGED = 'INTENT_LOGGED',
  PRIMARY_MARKET_LISTED = 'PRIMARY_MARKET_LISTED',
  ESCROW_SECURED = 'ESCROW_SECURED',
  HARVEST_READY = 'HARVEST_READY',
  CASCADE_ENGAGED = 'CASCADE_ENGAGED',
  LOGISTICS_DISPATCHED = 'LOGISTICS_DISPATCHED',
  TRANSIT_REQUIRED = 'TRANSIT_REQUIRED',
  TRANSIT_AMBIGUOUS = 'TRANSIT_AMBIGUOUS',
  IN_TRANSIT = 'IN_TRANSIT',
  DELIVERED = 'DELIVERED',
  TRANSACTION_SETTLED = 'TRANSACTION_SETTLED',
  STRUCTURAL_DOWNGRADE = 'STRUCTURAL_DOWNGRADE',
  COMPOST_ROUTED = 'COMPOST_ROUTED'
}

export interface AgritechEvents {
  'node:registered': { node: NodeIdentity };
  'order:cancelled': { intentId: string, assetId: string, quantity: number, currentLocation: [number, number] };
  'market:cleanup': { location: [number, number], quantity: number };
  'asset:harvest_deadline_breached': { assetId: string };
  'contract:fulfilled': { clusterId: string, revenue: number };
  'ASSET_PRIMARY_MARKET_MISSED': AssetPrimaryMarketMissedPayload;
  'LOGISTICS_DISPATCH_REQUIRED': LogisticsDispatchRequiredPayload;
  'ASSET_INTENT_LOGGED': AssetIntentLoggedPayload;
  'LOGISTICS_PICKUP_REQUESTED': LogisticsPickupRequestedPayload;
  'MARKET_CIRCUIT_BREAKER_ACTIVATED': MarketCircuitBreakerActivatedPayload;
  'ESCROW_SECURED': EscrowSecuredPayload;
}
