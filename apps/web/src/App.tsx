import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import Dashboard from './pages/Dashboard';
import CultivatorPortal from './pages/CultivatorPortal';
import BuyerPortal from './pages/BuyerPortal';
import OraclePortal from './pages/OraclePortal';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="cultivator" element={<CultivatorPortal />} />
          <Route path="buyer" element={<BuyerPortal />} />
          <Route path="oracle" element={<OraclePortal />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
