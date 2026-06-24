import React, { useState, useEffect } from 'react';
import './components.css';

export default function LiveEventStream() {
  const [events, setEvents] = useState([
    { id: 1, topic: 'node.identity.registration', payload: 'NODE_REGISTRATION_CONFIRMED | uuid: 8a4b...' },
    { id: 2, topic: 'cluster.aggregation.detected', payload: 'SPONTANEOUS_CLUSTER_PROPOSED | 3 Nodes' },
    { id: 3, topic: 'market.routing.cascade', payload: 'ASSET_INTENT_LOGGED | 1000kg Tomato' },
  ]);

  // Simulate incoming kafka events
  useEffect(() => {
    const interval = setInterval(() => {
      const newEvent = { 
        id: Date.now(), 
        topic: 'logistics.delivery.verified', 
        payload: `DELIVERED | cluster_${Math.floor(Math.random() * 1000)}` 
      };
      setEvents(prev => [newEvent, ...prev].slice(0, 15));
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="glass-panel component-container h-full">
      <div className="component-header">
        <h2>Kafka Event Stream</h2>
        <div className="connection-status">
          <div className="status-indicator"></div>
          <span className="mono">Connected (9092)</span>
        </div>
      </div>

      <div className="terminal-window mono">
        {events.map((ev) => (
          <div key={ev.id} className="terminal-line">
            <span className="timestamp">[{new Date(ev.id).toLocaleTimeString()}]</span>
            <span className="topic text-blue"> {ev.topic} </span>
            <span className="payload text-green"> {ev.payload} </span>
          </div>
        ))}
        <div className="terminal-cursor">_</div>
      </div>
    </div>
  );
}
