import { eventBus } from '../../packages/event-bus/index';
import { 
  IntakeDraft, 
  CommodityType, 
  Asset, 
  GradeTier,
  AssetIntentLoggedPayload
} from '../../packages/types/index';
import * as crypto from 'crypto';

export class IntakeApi {
  
  public async receiveOfflineSync(drafts: IntakeDraft[]) {
    console.log(`[IntakeApi] Received offline sync batch containing ${drafts.length} drafts.`);
    
    for (const draft of drafts) {
      await this.processDraft(draft);
    }
  }

  private async processDraft(draft: IntakeDraft) {
    console.log(`[IntakeApi] Processing draft: ${draft.draft_id} for ${draft.estimated_weight_kg}kg of ${draft.crop_type}...`);
    
    // 1. Automated Inference
    const spoilageDays = this.inferSpoilageWindow(draft.crop_type);
    const spoilageCriticalDate = new Date();
    spoilageCriticalDate.setDate(spoilageCriticalDate.getDate() + spoilageDays);

    // 2. AI Verification Pipeline (Running parallel to self-reported grading)
    const verificationStatus = await this.runAIVerificationMock(draft);

    // 3. Hydrate into the AssetContract Schema
    const assetContract: Asset = {
      asset_id: `ASSET-${crypto.randomBytes(4).toString('hex').toUpperCase()}`,
      origin_node_id: draft.origin_node_id,
      profile: {
        commodity: draft.crop_type,
        initial_grade: draft.self_reported_grade,
        quantity_kg: draft.estimated_weight_kg,
        harvest_at: new Date().toISOString(),
        spoilage_at: spoilageCriticalDate.toISOString()
      },
      routing: {
        current_tier: 1,
        active_buyer_id: null,
        cluster_id: null
      }
    };

    // 4. Fire the System Event
    const payload: AssetIntentLoggedPayload = {
      asset_id: assetContract.asset_id,
      origin_node_id: draft.origin_node_id,
      asset_contract: assetContract,
      ai_verification_status: verificationStatus
    };

    console.log(`[IntakeApi] Hydration complete. Firing ASSET_INTENT_LOGGED for ${assetContract.asset_id}`);
    eventBus.emitEvent('ASSET_INTENT_LOGGED', payload);
  }

  private inferSpoilageWindow(cropType: CommodityType): number {
    switch (cropType) {
      case CommodityType.Avocado: return 14;
      case CommodityType.Coffee: return 30; // Raw cherry before processing
      case CommodityType.Seedlings: return 3;
      case CommodityType.Organic_Waste: return 2;
      default: return 7;
    }
  }

  private async runAIVerificationMock(draft: IntakeDraft): Promise<'PENDING' | 'VERIFIED' | 'FLAGGED'> {
    console.log(`[IntakeApi] Running AI Vision check against photo proof: ${draft.photo_proof_url || 'N/A'}`);
    return new Promise(resolve => {
      setTimeout(() => {
        if (!draft.photo_proof_url) {
          console.warn(`[IntakeApi] -> AI Verification FLAGGED: Missing visual proof.`);
          resolve('FLAGGED');
        } else {
          console.log(`[IntakeApi] -> AI Verification VERIFIED: Confirmed ${draft.self_reported_grade} visually.`);
          resolve('VERIFIED');
        }
      }, 500); // 500ms mock delay
    });
  }
}

export const intakeApi = new IntakeApi();
