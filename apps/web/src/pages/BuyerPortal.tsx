import React, { useState } from 'react';
import { Target, DollarSign, Activity, Truck } from 'lucide-react';

const BuyerPortal: React.FC = () => {
  const [contractActive, setContractActive] = useState(false);

  return (
    <div className="portal-container buyer-view">
      <div className="buyer-dashboard glass-panel">
        <div className="buyer-header">
          <h2>Institutional Buyer Portal</h2>
          <div className="wallet-balance mono">
            Escrow Liquidity: $2,500,000.00
          </div>
        </div>

        <div className="contract-builder">
          <h3>Establish Target Contract ($Q_Target)</h3>
          
          <div className="contract-form">
            <div className="form-row">
              <div className="form-group">
                <label>Commodity</label>
                <select>
                  <option>Hass Avocados (Export Grade)</option>
                </select>
              </div>
              <div className="form-group">
                <label>Target Volume (kg)</label>
                <input type="number" defaultValue="50000" />
              </div>
              <div className="form-group">
                <label>Price per kg ($)</label>
                <input type="number" defaultValue="2.10" />
              </div>
            </div>
            
            <div className="contract-total">
              <span>Required Escrow Lock:</span>
              <span className="mono total-amount">$105,000.00</span>
            </div>

            {!contractActive ? (
              <button 
                className="deploy-contract-btn"
                onClick={() => setContractActive(true)}
              >
                <DollarSign size={16} /> Deploy Smart Contract & Fund Escrow
              </button>
            ) : (
              <div className="contract-status active">
                <Activity size={16} className="pulse" />
                <span>Contract Live. Searching for Proximity Clusters...</span>
              </div>
            )}
          </div>
        </div>

        {contractActive && (
          <div className="active-clusters">
            <h3>Matching Clusters</h3>
            <div className="cluster-card">
              <div className="cluster-info">
                <h4>Cluster Alpha-7 (Nairobi Region)</h4>
                <span className="mono status-filling">Filling: 34,000 / 50,000 kg</span>
              </div>
              <div className="cluster-actions">
                <button className="view-logistics-btn"><Truck size={14} /> Track Transit</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BuyerPortal;
