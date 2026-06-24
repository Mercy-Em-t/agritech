import React, { useState } from 'react';
import { Wifi, WifiOff, UploadCloud, MapPin, Leaf, Calendar, Droplets } from 'lucide-react';

const CultivatorPortal: React.FC = () => {
  const [isOnline, setIsOnline] = useState(false);
  const [pendingLogs, setPendingLogs] = useState(0);

  const handleOfflineSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPendingLogs(prev => prev + 1);
    // Simulated CRDT offline log
  };

  const handleSync = () => {
    if (isOnline && pendingLogs > 0) {
      setTimeout(() => setPendingLogs(0), 1500);
    }
  };

  return (
    <div className="portal-container cultivator-view">
      <div className="mobile-mockup glass-panel">
        <div className="mobile-header">
          <h2>Cultivator Edge</h2>
          <button 
            className={`network-toggle ${isOnline ? 'online' : 'offline'}`}
            onClick={() => setIsOnline(!isOnline)}
          >
            {isOnline ? <Wifi size={16} /> : <WifiOff size={16} />}
            {isOnline ? 'Online' : 'Offline'}
          </button>
        </div>

        <div className="crdt-status">
          <div className="status-badge">
            <span className="mono">Pending Syncs: {pendingLogs}</span>
            {isOnline && pendingLogs > 0 && (
              <button className="sync-btn" onClick={handleSync}>
                <UploadCloud size={14} /> Sync Now
              </button>
            )}
          </div>
        </div>

        <form className="harvest-form" onSubmit={handleOfflineSubmit}>
          <h3>Log Harvest Intent</h3>
          
          <div className="form-group">
            <label><Leaf size={14} /> Commodity Type</label>
            <select required>
              <option value="Hass_Avocados">Hass Avocados</option>
              <option value="Arabica_Coffee">Arabica Coffee</option>
              <option value="Macadamia">Macadamia Nuts</option>
            </select>
          </div>

          <div className="form-group">
            <label>Estimated Yield (kg)</label>
            <input type="number" min="1" placeholder="e.g. 500" required />
          </div>

          <div className="form-group">
            <label><MapPin size={14} /> Geo-Location</label>
            <button type="button" className="gps-btn">Capture Current GPS</button>
            <span className="mono small">Lat: -1.2921, Lng: 36.8219</span>
          </div>

          <div className="form-group">
            <label><Calendar size={14} /> Expected Harvest Date</label>
            <input type="date" required />
          </div>

          <div className="form-group">
            <label><Droplets size={14} /> Agronomic Data</label>
            <div className="checkbox-group">
              <label><input type="checkbox" /> Organic Certified</label>
              <label><input type="checkbox" /> Pesticide Used</label>
            </div>
          </div>

          <button type="submit" className="submit-intent-btn">Save to Offline Ledger</button>
        </form>
      </div>
    </div>
  );
};

export default CultivatorPortal;
