import React from 'react';

export default function IrisShopModal({ isOpen, onClose, player, onPurchase }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-slate-900 rounded-xl p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-bold text-white mb-4">Iris's Shop</h2>
        <p className="text-slate-300 mb-4">Purchase items to expand your berry farm.</p>
        <p className="text-sm text-slate-400 mb-4">Current Gold: {player?.gold || 0}g</p>
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