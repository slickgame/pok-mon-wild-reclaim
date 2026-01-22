import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRightLeft, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function PartySwapModal({ partyPokemon, storagePokemon, onClose, onSwap }) {
  const [selectedPartyPokemon, setSelectedPartyPokemon] = useState(null);

  const handleSwap = () => {
    if (!selectedPartyPokemon) return;
    onSwap(selectedPartyPokemon, storagePokemon);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="glass rounded-2xl max-w-2xl w-full p-6"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Party is Full</h2>
                <p className="text-sm text-slate-400">Select a Pokémon to send to storage</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Swap Preview */}
          <div className="bg-slate-800/50 rounded-xl p-4 mb-6">
            <div className="grid grid-cols-3 gap-4 items-center">
              {/* Storage Pokémon */}
              <div className="text-center">
                <p className="text-xs text-slate-400 mb-2">Adding to Party</p>
                <div className="glass rounded-lg p-3">
                  {storagePokemon.spriteUrl ? (
                    <img
                      src={storagePokemon.spriteUrl}
                      alt={storagePokemon.species}
                      className="w-16 h-16 mx-auto object-contain"
                    />
                  ) : (
                    <div className="w-16 h-16 mx-auto rounded-full bg-slate-700 flex items-center justify-center">
                      <span className="text-2xl">?</span>
                    </div>
                  )}
                  <p className="text-sm font-semibold text-white mt-2">
                    {storagePokemon.nickname || storagePokemon.species}
                  </p>
                  <Badge className="text-xs mt-1">Lv. {storagePokemon.level}</Badge>
                </div>
              </div>

              {/* Arrow */}
              <div className="flex justify-center">
                <ArrowRightLeft className="w-8 h-8 text-indigo-400" />
              </div>

              {/* Selected Party Pokémon */}
              <div className="text-center">
                <p className="text-xs text-slate-400 mb-2">Moving to Storage</p>
                {selectedPartyPokemon ? (
                  <div className="glass rounded-lg p-3 border-2 border-orange-500/50">
                    {selectedPartyPokemon.spriteUrl ? (
                      <img
                        src={selectedPartyPokemon.spriteUrl}
                        alt={selectedPartyPokemon.species}
                        className="w-16 h-16 mx-auto object-contain"
                      />
                    ) : (
                      <div className="w-16 h-16 mx-auto rounded-full bg-slate-700 flex items-center justify-center">
                        <span className="text-2xl">?</span>
                      </div>
                    )}
                    <p className="text-sm font-semibold text-white mt-2">
                      {selectedPartyPokemon.nickname || selectedPartyPokemon.species}
                    </p>
                    <Badge className="text-xs mt-1">Lv. {selectedPartyPokemon.level}</Badge>
                  </div>
                ) : (
                  <div className="glass rounded-lg p-3 h-full flex items-center justify-center min-h-[120px]">
                    <p className="text-sm text-slate-500">Select below</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Party Selection */}
          <div className="space-y-2 mb-6 max-h-64 overflow-y-auto">
            <p className="text-sm font-medium text-slate-300 mb-3">Select Pokémon to Send to Storage:</p>
            {partyPokemon.map((pokemon) => (
              <motion.button
                key={pokemon.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedPartyPokemon(pokemon)}
                className={`w-full glass rounded-lg p-3 flex items-center gap-3 transition-all ${
                  selectedPartyPokemon?.id === pokemon.id
                    ? 'border-2 border-orange-500 bg-orange-500/10'
                    : 'border border-slate-700 hover:border-slate-600'
                }`}
              >
                {pokemon.spriteUrl ? (
                  <img
                    src={pokemon.spriteUrl}
                    alt={pokemon.species}
                    className="w-12 h-12 object-contain"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center">
                    <span className="text-xl">?</span>
                  </div>
                )}
                <div className="flex-1 text-left">
                  <p className="font-semibold text-white">
                    {pokemon.nickname || pokemon.species}
                  </p>
                  <div className="flex gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      Lv. {pokemon.level}
                    </Badge>
                    {pokemon.type1 && (
                      <Badge className="text-xs bg-slate-700">{pokemon.type1}</Badge>
                    )}
                  </div>
                </div>
              </motion.button>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 border-slate-600 hover:bg-slate-800"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSwap}
              disabled={!selectedPartyPokemon}
              className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 disabled:opacity-50"
            >
              <ArrowRightLeft className="w-4 h-4 mr-2" />
              Swap Pokémon
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}