import React from 'react';
import ClusterVisualizer from '../components/ClusterVisualizer';
import EscrowLedger from '../components/EscrowLedger';
import LiveEventStream from '../components/LiveEventStream';

const Dashboard: React.FC = () => {
  return (
    <div className="dashboard-grid">
      <div className="grid-left">
        <ClusterVisualizer />
        <EscrowLedger />
      </div>
      
      <div className="grid-right">
        <LiveEventStream />
      </div>
    </div>
  );
};

export default Dashboard;
