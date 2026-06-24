import React, { useState } from 'react';
import { ShieldCheck, Fingerprint, Microscope, AlertTriangle } from 'lucide-react';

const OraclePortal: React.FC = () => {
  const [signatureState, setSignatureState] = useState<'pending' | 'signing' | 'verified'>('pending');

  const handleSign = () => {
    setSignatureState('signing');
    setTimeout(() => setSignatureState('verified'), 2000);
  };

  return (
    <div className="portal-container oracle-view">
      <div className="oracle-terminal glass-panel">
        <div className="oracle-header">
          <h2>QA Oracle Verification Terminal</h2>
          <div className="auth-status mono">
            <Fingerprint size={14} /> Inspector ID: AUTH-8819X
          </div>
        </div>

        <div className="inspection-queue">
          <h3>Active Deliveries for Inspection</h3>
          
          <div className="inspection-card">
            <div className="card-header">
              <span className="mono">Shipment ID: TRK-991A</span>
              <span className="mono">Source: Cluster Alpha-7</span>
            </div>

            <div className="inspection-form">
              <div className="form-group">
                <label><Microscope size={14} /> Measured Moisture Level (%)</label>
                <input type="number" defaultValue="12.4" />
              </div>
              
              <div className="form-group">
                <label>Cryptographic Grade Assessment</label>
                <select>
                  <option>Tier 1 (Premium Export)</option>
                  <option>Tier 2 (Domestic Market)</option>
                  <option>Tier 3 (Spot Market / Juicing)</option>
                </select>
              </div>

              {signatureState === 'pending' && (
                <button className="sign-payload-btn" onClick={handleSign}>
                  <ShieldCheck size={16} /> Digitally Sign & Release Escrow
                </button>
              )}
              
              {signatureState === 'signing' && (
                <div className="signing-loader mono">
                  Generating RSA-256 Signature...
                </div>
              )}

              {signatureState === 'verified' && (
                <div className="verified-success mono">
                  <ShieldCheck size={16} /> Payload Signed. Escrow Released.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OraclePortal;
