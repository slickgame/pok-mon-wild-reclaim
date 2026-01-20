import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, ArrowRight, Trash2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ItemCard from '@/components/inventory/ItemCard';

const QUALITY_UPGRADES = {
  'Normal': { next: 'Fine', fragmentCost: 5, goldCost: 100 },
  'Fine': { next: 'Superior', fragmentCost: 15, goldCost: 300 },
  'Superior': { next: 'Masterwork', fragmentCost: 30, goldCost: 1000 },
  'Masterwork': { next: null, fragmentCost: 0, goldCost: 0 }
};

export default function ReforgePanel({ inventory = [], fragments = 0, gold = 0, onReforge, onRecycle }) {
  const [selectedItem, setSelectedItem] = useState(null);
  const [mode, setMode] = useState('upgrade'); // 'upgrade' or 'recycle'

  const reforgableItems = inventory.filter(item => 
    item.type !== 'Material' && item.type !== 'Fragment' && item.reforgeMaterialValue > 0
  );

  const canUpgrade = selectedItem && 
                     selectedItem.quality !== 'Masterwork' &&
                     fragments >= QUALITY_UPGRADES[selectedItem.quality]?.fragmentCost &&
                     gold >= QUALITY_UPGRADES[selectedItem.quality]?.goldCost;

  const handleAction = () => {
    if (!selectedItem) return;
    
    if (mode === 'recycle') {
      onRecycle?.(selectedItem);
      setSelectedItem(null);
    } else if (mode === 'upgrade' && canUpgrade) {
      onReforge?.(selectedItem);
      setSelectedItem(null);
    }
  };

  return (
    <div className="glass rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <RefreshCw className="w-5 h-5 text-cyan-400" />
          <h3 className="font-semibold text-white">Reforging Station</h3>
        </div>
        <div className="flex gap-2 text-sm">
          <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/50">
            ⚙️ {fragments} Fragments
          </Badge>
          <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/50">
            💰 {gold} Gold
          </Badge>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        <Button
          variant={mode === 'upgrade' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setMode('upgrade')}
          className={mode === 'upgrade' ? 'bg-indigo-500' : 'border-slate-700 text-slate-300'}
        >
          <Sparkles className="w-3 h-3 mr-1" /> Upgrade Quality
        </Button>
        <Button
          variant={mode === 'recycle' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setMode('recycle')}
          className={mode === 'recycle' ? 'bg-indigo-500' : 'border-slate-700 text-slate-300'}
        >
          <Trash2 className="w-3 h-3 mr-1" /> Recycle for Fragments
        </Button>
      </div>

      {reforgableItems.length > 0 ? (
        <div className="space-y-4">
          {/* Item Selection */}
          <div>
            <p className="text-xs text-slate-400 mb-2">Select an item:</p>
            <div className="grid grid-cols-6 gap-2 max-h-48 overflow-y-auto p-1">
              {reforgableItems.map((item) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  selected={selectedItem?.id === item.id}
                  onClick={() => setSelectedItem(item)}
                />
              ))}
            </div>
          </div>

          {/* Reforge Preview */}
          <AnimatePresence>
            {selectedItem && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-slate-800/50 rounded-xl p-4"
              >
                {mode === 'upgrade' ? (
                  <>
                    <div className="flex items-center justify-center gap-4 mb-4">
                      <div className="text-center">
                        <Badge className="bg-slate-700 text-slate-300 mb-2">
                          {selectedItem.quality}
                        </Badge>
                        <p className="text-white font-medium">{selectedItem.name}</p>
                      </div>
                      
                      {selectedItem.quality !== 'Masterwork' && (
                        <>
                          <ArrowRight className="w-6 h-6 text-slate-500" />
                          
                          <div className="text-center">
                            <Badge className="bg-gradient-to-r from-indigo-500 to-cyan-500 text-white mb-2">
                              {QUALITY_UPGRADES[selectedItem.quality]?.next}
                            </Badge>
                            <p className="text-white font-medium">{selectedItem.name}</p>
                          </div>
                        </>
                      )}
                    </div>

                    {selectedItem.quality === 'Masterwork' ? (
                      <div className="text-center py-4">
                        <p className="text-emerald-400 font-semibold">✨ Already Maximum Quality ✨</p>
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                          <div className="text-center">
                            <p className="text-slate-400">Fragments Needed</p>
                            <p className={`font-semibold ${
                              fragments >= QUALITY_UPGRADES[selectedItem.quality]?.fragmentCost 
                                ? 'text-emerald-400' 
                                : 'text-rose-400'
                            }`}>
                              {QUALITY_UPGRADES[selectedItem.quality]?.fragmentCost}
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-slate-400">Gold Cost</p>
                            <p className={`font-semibold ${
                              gold >= QUALITY_UPGRADES[selectedItem.quality]?.goldCost 
                                ? 'text-emerald-400' 
                                : 'text-rose-400'
                            }`}>
                              {QUALITY_UPGRADES[selectedItem.quality]?.goldCost}
                            </p>
                          </div>
                        </div>

                        <Button
                          className="w-full bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600"
                          disabled={!canUpgrade}
                          onClick={handleAction}
                        >
                          <RefreshCw className="w-4 h-4 mr-2" />
                          {canUpgrade ? 'Upgrade Quality' : 'Insufficient Resources'}
                        </Button>
                      </>
                    )}
                  </>
                ) : (
                  <>
                    <div className="text-center mb-4">
                      <p className="text-slate-400 text-sm mb-2">Recycling will yield:</p>
                      <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/50 text-lg px-4 py-2">
                        +{selectedItem.reforgeMaterialValue} Fragments
                      </Badge>
                    </div>
                    
                    <Button
                      className="w-full bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600"
                      onClick={handleAction}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Recycle Item
                    </Button>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ) : (
        <div className="text-center py-12 text-slate-400">
          <RefreshCw className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No reforgable items available</p>
          <p className="text-xs mt-1">Craft items to unlock reforging</p>
        </div>
      )}
    </div>
  );
}