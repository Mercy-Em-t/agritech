import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Activity, Tractor, Briefcase, CheckShield } from 'lucide-react';

const AppLayout: React.FC = () => {
  return (
    <div className="app-container">
      <header className="top-nav glass-panel">
        <div className="logo-section">
          <div className="status-indicator"></div>
          <h1>CoinOS <span>Edge</span></h1>
        </div>
        
        <nav className="role-nav">
          <NavLink to="/" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <Activity size={18} /> System Orchestrator
          </NavLink>
          <NavLink to="/cultivator" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <Tractor size={18} /> Cultivator Portal
          </NavLink>
          <NavLink to="/buyer" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <Briefcase size={18} /> Buyer Portal
          </NavLink>
          <NavLink to="/oracle" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <CheckShield size={18} /> QA Oracle
          </NavLink>
        </nav>

        <div className="nav-metrics mono">
          <span>Active Nodes: 12,042</span>
          <span>Ledger State: SYNCED</span>
        </div>
      </header>

      <main className="content-area">
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
