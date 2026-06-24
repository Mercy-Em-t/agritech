import { eventBus } from '../../packages/event-bus/index';
import { Asset, GradeTier } from '../../packages/types/index';

export class CascadeEngine {
  private assetLedger: Map<string, Asset> = new Map();

  constructor() {
    this.setupListeners();
  }

  private setupListeners() {
    eventBus.onEvent('order:cancelled', (payload) => {
      console.log(`[CascadeEngine] Detected cancellation for intent ${payload.intentId}. Re-routing asset...`);
      this.evaluateAssetDowngrade(payload);
    });

    eventBus.onEvent('market:cleanup', (payload) => {
      console.log(`[CascadeEngine] Market cleanup event detected. Generating ${payload.quantity} tons of organic waste...`);
      this.routeToCompost(payload);
    });

    eventBus.onEvent('MARKET_CIRCUIT_BREAKER_ACTIVATED', (payload) => {
      console.log(`[CascadeEngine] ⚡ CIRCUIT BREAKER ACTIVATED for ${payload.commodity} in ${payload.impacted_zone_id} ⚡`);
      console.log(`[CascadeEngine] Action: Forcing ${payload.commodity} downgrade to Tier ${payload.action_required.force_downgrade_to_tier}.`);
      console.log(`[CascadeEngine] Eligible processors: ${payload.action_required.eligible_processor_capabilities.join(', ')}`);
    });
  }

  private evaluateAssetDowngrade(payload: { intentId: string; assetId: string; quantity: number }) {
    console.log(`[CascadeEngine] Structural downgrade triggered for Asset: ${payload.assetId}. Routing to Extractor Node (Processing/Extraction).`);
  }

  private routeToCompost(payload: { location: [number, number]; quantity: number }) {
    console.log(`[CascadeEngine] Routing ${payload.quantity} tons directly to a Compost Node within transit radius of [${payload.location}].`);
  }

  public registerAssetContract(contract: Asset) {
    this.assetLedger.set(contract.asset_id, contract);
  }
}

export const cascadeEngine = new CascadeEngine();
