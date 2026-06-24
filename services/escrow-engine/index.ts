import { eventBus } from '../../packages/event-bus/index';
import { CreditVoucher } from '../../packages/types/index';
import * as crypto from 'crypto';

export class EscrowEngine {
  
  constructor() {
    this.setupListeners();
  }

  private setupListeners() {
    eventBus.onEvent('ESCROW_SECURED', (payload) => {
      console.log(`[EscrowEngine] Escrow Secured for Contract ${payload.contract_id}. Total Value: $${payload.total_value}`);
      this.issueMicroLoan(payload.supplier_node_id, payload.contract_id, payload.total_value);
    });
  }

  private issueMicroLoan(supplierId: string, contractId: string, totalValue: number) {
    const loanAmount = totalValue * 0.30; // 30% credit limit
    const voucher: CreditVoucher = {
      voucher_id: `VCH-${crypto.randomBytes(4).toString('hex').toUpperCase()}`,
      issued_to_node_id: supplierId,
      amount: loanAmount,
      locked_contract_id: contractId,
      usable_at_capabilities: ['has_nursery', 'has_compost']
    };

    console.log(`[EscrowEngine] *** CHECKMATE INITIATED: Issued Micro-Loan Voucher ${voucher.voucher_id} for $${loanAmount} to Node ${supplierId} ***`);
    console.log(`[EscrowEngine] Voucher locked to upstream network purchases only.`);
  }
}

export const escrowEngine = new EscrowEngine();
