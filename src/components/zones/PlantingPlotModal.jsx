import React from 'react';

export default function PlantingPlotModal({ isOpen, onClose, seeds, player, playerEmail, zone, gameTime, onPlant, onBuyPlot }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-slate-900 rounded-xl p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-bold text-white mb-4">Plant Seeds</h2>
        <p className="text-slate-300 mb-4">Select a seed to plant in your berry farm.</p>
        <div className="space-y-2 mb-6">
          {seeds.map(seed => (
            <button
              key={seed.id}
              onClick={() => {
                onPlant?.({ plotNumber: 1, seedName: seed.name });
                onClose();
              }}
              className="w-full text-left bg-slate-800 hover:bg-slate-700 rounded-lg p-3 text-white transition-colors"
            >
              {seed.name} (×{seed.quantity || 1})
            </button>
          ))}
        </div>
        <button
          onClick={onClose}
          className="w-full bg-slate-700 hover:bg-slate-600 text-white rounded-lg p-2 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
}