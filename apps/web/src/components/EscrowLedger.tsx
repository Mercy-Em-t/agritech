import React from 'react';
import './components.css';

export default function EscrowLedger() {
  const ledgerEntries = [
    { id: 'tx-1', type: 'ESCROW_LOCK', amount: 15000, node: 'Corp-A', status: 'LOCKED', time: '10:02:44 AM' },
    { id: 'tx-2', type: 'EDGE_FEE_COLLECTED', amount: -750, node: 'SYSTEM', status: 'SETTLED', time: '10:05:12 AM' },
    { id: 'tx-3', type: 'SETTLEMENT_CREDIT', amount: 8550, node: 'Node-7A', status: 'PENDING', time: '10:05:13 AM' },
    { id: 'tx-4', type: 'SETTLEMENT_CREDIT', amount: 5700, node: 'Node-2B', status: 'PENDING', time: '10:05:14 AM' },
  ];

  return (
    <div className="glass-panel component-container">
      <div className="component-header">
        <h2>Ledger Journal (P_i)</h2>
        <span className="live-badge blue mono">Append-Only</span>
      </div>

      <div className="table-container">
        <table className="ledger-table mono">
          <thead>
            <tr>
              <th>TX ID</th>
              <th>TYPE</th>
              <th>AMOUNT (USD)</th>
              <th>NODE</th>
              <th>STATUS</th>
            </tr>
          </thead>
          <tbody>
            {ledgerEntries.map((tx) => (
              <tr key={tx.id}>
                <td className="tx-id">{tx.id}</td>
                <td className={tx.type.includes('FEE') ? 'text-red' : 'text-blue'}>{tx.type}</td>
                <td className={tx.amount > 0 ? 'text-green' : 'text-red'}>
                  {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString()}
                </td>
                <td>{tx.node}</td>
                <td>
                  <span className={`status-pill ${tx.status.toLowerCase()}`}>{tx.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
