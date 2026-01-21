import React from 'react';
import { motion } from 'framer-motion';
import { Lock, CheckCircle2, Circle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const rarityColors = {
  Rare: 'from-blue-500 to-cyan-500',
  Epic: 'from-purple-500 to-pink-500',
  Legendary: 'from-yellow-500 to-orange-500',
  Mythic: 'from-red-500 to-pink-600',
};

export default function ItemSetCard({ itemSet, ownedPieces = [], onClick }) {
  const totalPieces = itemSet.totalPieces || 3;
  const ownedCount = ownedPieces.length;
  const isComplete = ownedCount >= totalPieces;
  const isDiscovered = itemSet.isDiscovered || ownedCount > 0;

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="glass rounded-xl overflow-hidden cursor-pointer"
    >
      {/* Header */}
      <div className={`h-24 bg-gradient-to-br ${rarityColors[itemSet.rarity]} relative`}>
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute top-3 left-3">
          <Badge className="bg-black/40 text-white border-white/20">
            {itemSet.rarity}
          </Badge>
        </div>
        <div className="absolute top-3 right-3">
          <Badge className={`${
            isComplete 
              ? 'bg-emerald-500/30 text-emerald-300 border-emerald-500/50' 
              : 'bg-slate-800/50 text-slate-300'
          }`}>
            {ownedCount}/{totalPieces}
          </Badge>
        </div>
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="text-white font-bold text-lg">{itemSet.name}</h3>
        </div>
      </div>

      {/* Body */}
      <div className="p-4">
        <p className="text-sm text-slate-400 mb-3">{itemSet.description}</p>

        {/* Pieces */}
        {isDiscovered ? (
          <div className="space-y-2 mb-3">
            {itemSet.pieces?.map((piece, idx) => {
              const isOwned = ownedPieces.some(p => p.itemName === piece.itemName);
              return (
                <div key={idx} className="flex items-center gap-2 text-sm">
                  {isOwned ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Circle className="w-4 h-4 text-slate-600" />
                  )}
                  <span className={isOwned ? 'text-white' : 'text-slate-500'}>
                    {piece.itemName}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-slate-500 mb-3">
            <Lock className="w-4 h-4" />
            <span className="text-sm">Undiscovered</span>
          </div>
        )}

        {/* Set Bonuses */}
        {isDiscovered && (
          <div className="space-y-2 pt-3 border-t border-slate-700">
            <div className="text-xs text-slate-400">
              <span className="font-semibold">2-Piece:</span> {itemSet.twoPieceBonus}
            </div>
            {itemSet.threePieceBonus && (
              <div className="text-xs text-slate-400">
                <span className="font-semibold">3-Piece:</span> {itemSet.threePieceBonus}
              </div>
            )}
          </div>
        )}

        {/* Recommended Roles */}
        {itemSet.recommendedRoles?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {itemSet.recommendedRoles.map((role, idx) => (
              <Badge key={idx} className="text-xs bg-indigo-500/20 text-indigo-300 border-indigo-500/50">
                {role}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}