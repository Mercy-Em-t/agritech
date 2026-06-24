import { createMachine, interpret, assign } from 'xstate';
import { eventBus } from '../../packages/event-bus/index';
import { AssetLifecycleState } from '../../packages/types/index';

// Define the XState Machine for Asset Lifecycles
export const assetMachine = createMachine({
  id: 'asset',
  initial: AssetLifecycleState.INTENT_LOGGED,
  context: {
    assetId: '',
    tier: 1
  },
  states: {
    [AssetLifecycleState.INTENT_LOGGED]: {
      on: {
        'LOGISTICS_DISPATCH_REQUIRED': { target: AssetLifecycleState.LOGISTICS_DISPATCHED }
      }
    },
    [AssetLifecycleState.LOGISTICS_DISPATCHED]: {
      on: {
        'HARVEST_READY': { target: AssetLifecycleState.HARVEST_READY }
      }
    },
    [AssetLifecycleState.HARVEST_READY]: {
      on: {
        'HARVEST_DEADLINE_BREACHED': { 
          target: AssetLifecycleState.CASCADE_ENGAGED,
          actions: ['triggerCircuitBreaker']
        },
        'TRANSIT_REQUIRED': { target: AssetLifecycleState.TRANSIT_REQUIRED }
      }
    },
    [AssetLifecycleState.TRANSIT_REQUIRED]: {
      on: {
        'TRANSIT_AMBIGUOUS': { target: AssetLifecycleState.TRANSIT_AMBIGUOUS },
        'DELIVERED': { target: AssetLifecycleState.DELIVERED }
      }
    },
    [AssetLifecycleState.TRANSIT_AMBIGUOUS]: {
      on: {
        'TRANSIT_REQUIRED': { target: AssetLifecycleState.TRANSIT_REQUIRED },
        'CASCADE_ENGAGED': { target: AssetLifecycleState.CASCADE_ENGAGED }
      }
    },
    [AssetLifecycleState.CASCADE_ENGAGED]: {
      on: {
        'TIER_DOWNGRADED': { actions: ['downgradeTier'] }
      }
    },
    [AssetLifecycleState.DELIVERED]: {
      type: 'final'
    }
  }
}, {
  actions: {
    triggerCircuitBreaker: (context, event) => {
      console.log(`[XState] HARVEST_READY temporal deadline breached for ${context.assetId}. Triggering Circuit Breaker.`);
      eventBus.emitEvent('ASSET_PRIMARY_MARKET_MISSED', {
        asset_id: context.assetId,
        missed_buyer_id: 'defaulting_buyer',
        current_tier: context.tier,
        time_since_harvest_hours: 0
      });
    },
    downgradeTier: assign({
      tier: (context, event: any) => event.newTier || (context.tier + 1)
    })
  }
});

// Class to manage active machine instances per asset
export class EventStateMachine {
  private activeServices: Map<string, any> = new Map();

  constructor() {
    this.setupListeners();
  }

  private setupListeners() {
    eventBus.onEvent('ASSET_INTENT_LOGGED', (payload) => {
      console.log(`[EventStateMachine] Captured Intent Logged event for Asset ${payload.asset_id}`);
      this.registerAsset(payload.asset_id);
    });
  }

  public registerAsset(assetId: string) {
    const service = interpret(assetMachine.withContext({ assetId, tier: 1 }))
      .onTransition((state) => {
        if (state.changed) {
          console.log(`[XState] Asset ${assetId} transitioned to [${state.value}]`);
        }
      })
      .start();
      
    this.activeServices.set(assetId, service);
  }

  public sendEvent(assetId: string, event: string, payload?: any) {
    const service = this.activeServices.get(assetId);
    if (service) {
      service.send({ type: event, ...payload });
    } else {
      console.error(`[EventStateMachine] No active state machine found for asset ${assetId}`);
    }
  }
}

export const eventStateMachine = new EventStateMachine();
