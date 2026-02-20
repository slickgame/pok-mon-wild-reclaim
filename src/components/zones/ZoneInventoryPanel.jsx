import React from 'react';

export default function ZoneInventoryPanel({ items }) {
  return (
    <div className="glass rounded-xl p-4">
      <h3 className="text-sm font-semibold text-white mb-3">Inventory</h3>
      <div className="space-y-2">
        {items.map(item => (
          <div key={item.id} className="flex items-center justify-between bg-slate-800/50 rounded-lg p-2">
            <span className="text-sm text-white">{item.name}</span>
            <span className="text-xs text-slate-400">×{item.quantity || 1}</span>
          </div>
        ))}
      </div>
    </div>
  );
}