import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, Edit3, Check, X, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { updateCatchStreak, getStreakData } from '@/components/systems/shiny/shinySystem';

export default function CaptureSuccessModal({ 
  pokemon, 
  addedToParty, 
  onComplete 
}) {
  const [stage, setStage] = useState('congratulations'); // 'congratulations', 'nickname', 'complete'
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');

  const handleNicknameSubmit = () => {
    const trimmed = nickname.trim();
    
    if (trimmed.length > 12) {
      setError('Nickname must be 12 characters or less');
      return;
    }

    onComplete(trimmed || null);
  };

  const handleSkipNickname = () => {
    onComplete(null);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.8, y: 50 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.8, y: 50 }}
          className="glass rounded-2xl max-w-md w-full p-8 text-center"
        >
          {stage === 'congratulations' && (
            <>
              <motion.div
                animate={{ rotate: [0, 10, -10, 10, 0], scale: [1, 1.1, 1] }}
                transition={{ duration: 0.6 }}
                className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center"
              >
                <Trophy className="w-10 h-10 text-white" />
              </motion.div>

              <h2 className="text-3xl font-bold text-white mb-2">Gotcha!</h2>
              <p className="text-xl text-indigo-400 mb-6">
                You caught a {pokemon.species}!
              </p>

              {/* Sprite */}
              <div className="flex justify-center mb-6">
                {pokemon.spriteUrl ? (
                  <img
                    src={pokemon.spriteUrl}
                    alt={pokemon.species}
                    className="w-32 h-32 object-contain"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-slate-800 flex items-center justify-center">
                    <span className="text-5xl">?</span>
                  </div>
                )}
              </div>

              {/* Location Info */}
              <div className="bg-slate-800/50 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-center gap-2 mb-2">
                  {addedToParty ? (
                    <>
                      <Star className="w-5 h-5 text-yellow-400" />
                      <p className="text-white font-semibold">Added to Party</p>
                    </>
                  ) : (
                    <>
                      <Badge className="bg-indigo-500">Storage</Badge>
                      <p className="text-slate-300">Sent to Storage Box</p>
                    </>
                  )}
                </div>
                {!addedToParty && (
                  <p className="text-xs text-slate-400">Your party is full</p>
                )}
              </div>

              <Button
                onClick={() => {
                  if (addedToParty) {
                    setStage('nickname');
                  } else {
                    handleSkipNickname();
                  }
                }}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
              >
                {addedToParty ? 'Give Nickname?' : 'Continue'}
              </Button>

              {addedToParty && (
                <Button
                  variant="ghost"
                  onClick={handleSkipNickname}
                  className="w-full mt-2 text-slate-400 hover:text-white"
                >
                  Skip
                </Button>
              )}
            </>
          )}

          {stage === 'nickname' && (
            <>
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                <Edit3 className="w-8 h-8 text-white" />
              </div>

              <h2 className="text-2xl font-bold text-white mb-2">Set Nickname</h2>
              <p className="text-sm text-slate-400 mb-6">
                Give {pokemon.species} a unique name!
              </p>

              {/* Sprite */}
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

              <div className="mb-6">
                <Input
                  value={nickname}
                  onChange={(e) => {
                    setNickname(e.target.value);
                    setError('');
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleNicknameSubmit();
                    if (e.key === 'Escape') handleSkipNickname();
                  }}
                  placeholder={pokemon.species}
                  maxLength={12}
                  className="bg-slate-800/50 border-slate-700 text-white text-center text-lg"
                  autoFocus
                />
                <div className="flex justify-between mt-2">
                  {error && <p className="text-xs text-red-400">{error}</p>}
                  <p className="text-xs text-slate-500 ml-auto">
                    {nickname.length}/12
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleSkipNickname}
                  className="flex-1 border-slate-600 hover:bg-slate-800"
                >
                  <X className="w-4 h-4 mr-2" />
                  Skip
                </Button>
                <Button
                  onClick={handleNicknameSubmit}
                  className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Confirm
                </Button>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}