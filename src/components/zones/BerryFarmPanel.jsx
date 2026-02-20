import React from 'react';

export default function BerryFarmPanel({ player, playerEmail, zone, gameTime, seeds, onPlant, onBuyPlot, onHarvest }) {
  return (
    <div className="glass rounded-xl p-4">
      <h3 className="text-sm font-semibold text-white mb-3">Berry Farm</h3>
      <p className="text-xs text-slate-400">Your berry farm panel</p>
    </div>
  );
}