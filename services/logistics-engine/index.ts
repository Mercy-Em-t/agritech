import { eventBus } from '../../packages/event-bus/index';
import { LogisticsDispatchRequiredPayload, LogisticsProfile, NodeIdentity, FleetType } from '../../packages/types/index';

export class LogisticsEngine {
  // Simulating active logistics nodes in the system
  private availableLogisticsNodes: NodeIdentity[] = [];

  constructor() {
    this.setupListeners();
  }

  public registerLogisticsNode(node: NodeIdentity) {
    if (node.logistics_profile) {
      this.availableLogisticsNodes.push(node);
      console.log(`[LogisticsEngine] Registered Transporter: ${node.identity.legal_name} [${node.logistics_profile.fleet_type}]`);
    }
  }

  private setupListeners() {
    eventBus.onEvent('LOGISTICS_DISPATCH_REQUIRED', (payload) => {
      console.log(`[LogisticsEngine] Dispatch Required for Asset ${payload.asset_id} to destination ${payload.destination.node_id}`);
      this.calculatePerishabilityMatch(payload);
    });
  }

  private calculatePerishabilityMatch(payload: LogisticsDispatchRequiredPayload) {
    console.log(`[LogisticsEngine] Running Perishability-Weighted Matching...`);
    
    let bestMatch: { node: NodeIdentity; score: number } | null = null;
    const T_spoil = payload.max_transit_time_hours;

    for (const node of this.availableLogisticsNodes) {
      const profile = node.logistics_profile!;
      
      // Calculate capability multiplier
      const C_match = profile.fleet_type === payload.required_fleet_type ? 1.5 : 0.5;

      // Mock transit time & distance cost for scaffold
      const T_transit = 4; // Mock 4 hours
      const D_cost = 0.2; // Mock distance cost penalty

      if (T_transit >= T_spoil) {
        console.log(`[LogisticsEngine] -> Rejected ${node.identity.legal_name}: Transit time exceeds spoilage window.`);
        continue;
      }

      // S_t = ((T_spoil - T_transit) / T_spoil) * C_match - D_cost
      const S_t = ((T_spoil - T_transit) / T_spoil) * C_match - D_cost;
      console.log(`[LogisticsEngine] -> Evaluated ${node.identity.legal_name} (Pricing: ${profile.pricing_model}). Transit Score (S_t) = ${S_t.toFixed(2)}`);

      if (!bestMatch || S_t > bestMatch.score) {
        bestMatch = { node, score: S_t };
      }
    }

    if (bestMatch) {
      console.log(`[LogisticsEngine] *** DISPATCH AWARDED to ${bestMatch.node.identity.legal_name} with score ${bestMatch.score.toFixed(2)} ***`);
      // Would emit DISPATCH_AWARDED event here to update the state machine
    } else {
      console.warn(`[LogisticsEngine] CRITICAL WARNING: No viable logistics node found to prevent spoilage of Asset ${payload.asset_id}.`);
    }
  }
}

export const logisticsEngine = new LogisticsEngine();
