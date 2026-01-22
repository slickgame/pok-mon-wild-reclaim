import React from 'react';
import { Shield, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function ItemsTab({ pokemon }) {
  const maxSlots = 3;
  const currentItems = pokemon.heldItems || [];
  const availableSlots = maxSlots - currentItems.length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-indigo-400" />
          <h3 className="text-sm font-semibold text-white">
            Held Items ({currentItems.length}/{maxSlots})
          </h3>
        </div>
      </div>

      {/* Item Slots */}
      <div className="grid grid-cols-3 gap-3">
        {[1, 2, 3].map((slotNum) => {
          const item = currentItems[slotNum - 1];
          
          return (
            <div
              key={slotNum}
              className={`aspect-square rounded-lg border-2 ${
                item
                  ? 'border-indigo-500/30 bg-indigo-500/10'
                  : 'border-dashed border-slate-700 bg-slate-800/50'
              } flex flex-col items-center justify-center p-3 relative group`}
            >
              {item ? (
                <>
                  <div className="text-3xl mb-2">💎</div>
                  <p className="text-xs text-white text-center truncate w-full">
                    {typeof item === 'string' ? item : item.name}
                  </p>
                  <button
                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500/80 hover:bg-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3 text-white" />
                  </button>
                </>
              ) : (
                <button className="w-full h-full flex flex-col items-center justify-center hover:bg-slate-700/30 transition-colors rounded-lg">
                  <Plus className="w-6 h-6 text-slate-600 mb-1" />
                  <p className="text-xs text-slate-600">Slot {slotNum}</p>
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Item Effects */}
      {currentItems.length > 0 && (
        <div className="glass rounded-xl p-4">
          <h4 className="text-sm font-semibold text-white mb-3">Active Effects</h4>
          <div className="space-y-2">
            {currentItems.map((item, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <Badge className="bg-indigo-600 text-xs">
                  {typeof item === 'string' ? item : item.name}
                </Badge>
                <p className="text-xs text-slate-400 flex-1">
                  Provides battle bonuses and synergies
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Set Bonuses */}
      <div className="glass rounded-xl p-4">
        <h4 className="text-sm font-semibold text-white mb-3">Set Bonuses</h4>
        <p className="text-xs text-slate-400 mb-2">
          Equip items from the same set to unlock powerful bonuses:
        </p>
        <div className="space-y-1 text-xs text-slate-400">
          <p>• <strong className="text-slate-300">2-piece:</strong> Moderate bonus effect</p>
          <p>• <strong className="text-slate-300">3-piece:</strong> Powerful bonus effect</p>
        </div>
        <Button size="sm" variant="outline" className="w-full mt-3">
          Browse Item Sets
        </Button>
      </div>

      {/* Info */}
      <div className="glass rounded-xl p-4">
        <h4 className="text-xs font-semibold text-white mb-2">About Held Items</h4>
        <p className="text-xs text-slate-400">
          Held items provide passive stat boosts and can trigger special effects during battle. 
          Items from the same set provide additional bonuses when equipped together.
        </p>
      </div>
    </div>
  );
}