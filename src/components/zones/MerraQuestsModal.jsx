import React from 'react';

export default function MerraQuestsModal({ isOpen, onClose, player, berryPlots, items, gameTime, onQuestComplete }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-slate-900 rounded-xl p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-bold text-white mb-4">Merra's Quests</h2>
        <p className="text-slate-300 mb-4">Complete quests to earn rewards.</p>
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