import React from 'react';
import './components.css';

export default function ClusterVisualizer() {
  return (
    <div className="glass-panel component-container">
      <div className="component-header">
        <h2>Spatial Proximity Clusters</h2>
        <span className="live-badge mono">ST_DWithin Active</span>
      </div>
      
      <div className="map-mockup">
        {/* Mocking a map with CSS to match the glassmorphism aesthetic */}
        <div className="radar-sweep"></div>
        
        <div className="node producer" style={{ top: '30%', left: '40%' }}>
          <div className="pulse"></div>
        </div>
        <div className="node producer" style={{ top: '35%', left: '45%' }}>
          <div className="pulse"></div>
        </div>
        <div className="node processor" style={{ top: '45%', left: '55%' }}>
          <div className="pulse"></div>
        </div>
        
        {/* Connection lines simulating the cluster grouping */}
        <svg className="cluster-lines" width="100%" height="100%">
          <line x1="40%" y1="30%" x2="45%" y2="35%" stroke="rgba(0, 255, 163, 0.4)" strokeWidth="2" />
          <line x1="45%" y1="35%" x2="55%" y2="45%" stroke="rgba(0, 255, 163, 0.4)" strokeWidth="2" strokeDasharray="4" />
        </svg>

        <div className="cluster-overlay">
          <div className="cluster-info glass-panel">
            <h4>Virtual Co-Op: C-8842</h4>
            <div className="stat mono">Target: 5,000kg Avocado</div>
            <div className="stat mono">Current: 4,850kg (97%)</div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: '97%' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
