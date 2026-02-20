import React from 'react';

export default function ZoneLogbook({ zone, zoneProgress }) {
  return (
    <div className="glass rounded-xl p-4">
      <h3 className="text-sm font-semibold text-white mb-3">Logbook</h3>
      <div className="space-y-2 text-sm text-slate-300">
        <p>Zone: {zone.name}</p>
        <p>Discovery: {zoneProgress?.discoveryProgress || 0}%</p>
        <p>Explorations: {zoneProgress?.explorationCount || 0}</p>
      </div>
    </div>
  );
}