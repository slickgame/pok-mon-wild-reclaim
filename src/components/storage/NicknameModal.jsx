import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Edit3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function NicknameModal({ pokemon, onClose, onSave }) {
  const [nickname, setNickname] = useState(pokemon.nickname || '');
  const [error, setError] = useState('');

  useEffect(() => {
    setNickname(pokemon.nickname || '');
  }, [pokemon]);

  const handleSave = () => {
    const trimmed = nickname.trim();
    
    if (trimmed.length > 12) {
      setError('Nickname must be 12 characters or less');
      return;
    }

    onSave(trimmed || null);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      onClose();
    }
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
          className="glass rounded-2xl max-w-md w-full p-6"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                <Edit3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Set Nickname</h2>
                <p className="text-sm text-slate-400">{pokemon.species}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Sprite Preview */}
          <div className="flex justify-center mb-4">
            {pokemon.spriteUrl ? (
              <img
                src={pokemon.spriteUrl}
                alt={pokemon.species}
                className="w-24 h-24 object-contain"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-slate-800 flex items-center justify-center">
                <span className="text-4xl">?</span>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-300 mb-2 block">
                Nickname (max 12 characters)
              </label>
              <Input
                value={nickname}
                onChange={(e) => {
                  setNickname(e.target.value);
                  setError('');
                }}
                onKeyDown={handleKeyPress}
                placeholder={pokemon.species}
                maxLength={12}
                className="bg-slate-800/50 border-slate-700 text-white"
                autoFocus
              />
              <div className="flex justify-between mt-1">
                {error && <p className="text-xs text-red-400">{error}</p>}
                <p className="text-xs text-slate-500 ml-auto">
                  {nickname.length}/12
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1 border-slate-600 hover:bg-slate-800"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
              >
                <Check className="w-4 h-4 mr-2" />
                Save
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}