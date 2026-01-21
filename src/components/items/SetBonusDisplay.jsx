import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Zap, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function SetBonusDisplay({ equippedSet, piecesEquipped, totalPieces, bonuses }) {
  const hasTwoPiece = piecesEquipped >= 2;
  const hasThreePiece = piecesEquipped >= 3;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass rounded-xl p-4 border border-cyan-500/30"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-cyan-400" />
          <h4 className="text-white font-semibold">{equippedSet}</h4>
        </div>
        <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/50">
          {piecesEquipped}/{totalPieces} Equipped
        </Badge>
      </div>

      <div className="space-y-2">
        {/* 2-Piece Bonus */}
        {bonuses.twoPiece && (
          <div className={`flex items-start gap-2 p-2 rounded-lg ${
            hasTwoPiece ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-slate-800/50'
          }`}>
            {hasTwoPiece ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            ) : (
              <div className="w-4 h-4 rounded-full border-2 border-slate-600 flex-shrink-0 mt-0.5" />
            )}
            <div>
              <p className="text-xs font-semibold text-slate-400">2-Piece Bonus</p>
              <p className={`text-sm ${hasTwoPiece ? 'text-emerald-300' : 'text-slate-500'}`}>
                {bonuses.twoPiece}
              </p>
            </div>
          </div>
        )}

        {/* 3-Piece Bonus */}
        {bonuses.threePiece && (
          <div className={`flex items-start gap-2 p-2 rounded-lg ${
            hasThreePiece ? 'bg-cyan-500/10 border border-cyan-500/30' : 'bg-slate-800/50'
          }`}>
            {hasThreePiece ? (
              <Zap className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
            ) : (
              <div className="w-4 h-4 rounded-full border-2 border-slate-600 flex-shrink-0 mt-0.5" />
            )}
            <div>
              <p className="text-xs font-semibold text-slate-400">3-Piece Bonus</p>
              <p className={`text-sm ${hasThreePiece ? 'text-cyan-300' : 'text-slate-500'}`}>
                {bonuses.threePiece}
              </p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}