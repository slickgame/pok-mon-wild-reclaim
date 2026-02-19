import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Swords } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const FACTION_COLORS = {
  'Thorn Syndicate': 'from-rose-900/80 to-red-950/90 border-red-700/50',
  'Team Eclipse':    'from-purple-900/80 to-indigo-950/90 border-purple-700/50',
};

const FACTION_BADGE_COLORS = {
  'Thorn Syndicate': 'bg-red-700/40 text-red-200 border-red-600/40',
  'Team Eclipse':    'bg-purple-700/40 text-purple-200 border-purple-600/40',
};

const AI_TIER_LABELS = { 1: 'Grunt', 2: 'Veteran', 3: 'Boss' };

// Per-trainer taunts (keyed by trainer id)
const TRAINER_TAUNTS = {
  rusk_vale:           [
    "You're in Thorn Syndicate territory now. Move along — or get moved.",
    "Don't make me pull a Pidgey on you.",
    "I've cleared bigger obstacles than you before breakfast.",
  ],
  marta_siltgrin:      [
    "Nature's patience is endless. Mine, less so.",
    "Every berry you pick is one I'm owed. Pay up.",
    "Sleep, drain, repeat. That's the Siltgrin way.",
  ],
  kade_and_nix:        [
    "Two against one? We prefer to call it 'efficient'.",
    "Kade takes the left flank. I take everything else.",
    "You should've turned back when the path got thorny.",
  ],
  foreman_bramblejack: [
    "I've shut down every route through this grove. You're next.",
    "Six Pokémon. One of me. Still not enough for you?",
    "This contract's been running longer than you've been alive. Don't ruin it.",
  ],
};

function getTrainerTaunt(trainerId) {
  const pool = TRAINER_TAUNTS[trainerId];
  if (!pool?.length) return "You picked the wrong path, challenger.";
  return pool[Math.floor(Math.random() * pool.length)];
}

export default function TrainerIntroModal({ trainer, roster, onBegin }) {
  const [visible, setVisible] = useState(true);
  const [taunt] = useState(() => getTrainerTaunt(trainer?.id));

  if (!visible || !trainer) return null;

  const faction = trainer.faction || 'Unknown';
  const gradientClass = FACTION_COLORS[faction] || 'from-slate-900/80 to-slate-950/90 border-slate-700/50';
  const badgeClass = FACTION_BADGE_COLORS[faction] || 'bg-slate-700/40 text-slate-200';
  const tierLabel = AI_TIER_LABELS[trainer.aiTier] || 'Trainer';

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className={`relative w-full max-w-md rounded-2xl border bg-gradient-to-br ${gradientClass} shadow-2xl overflow-hidden`}
          initial={{ scale: 0.85, y: 40 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 320, damping: 28 }}
        >
          {/* Top accent bar */}
          <div className="h-1 w-full bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500" />

          <div className="p-6">
            {/* Header row */}
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge className={`text-xs border ${badgeClass}`}>{faction}</Badge>
                  <Badge className="text-xs bg-slate-800/60 text-slate-300 border-slate-600/40">{tierLabel}</Badge>
                </div>
                <h2 className="text-2xl font-bold text-white leading-tight">{trainer.name}</h2>
                {trainer.archetype && (
                  <p className="text-sm text-slate-400 mt-0.5 italic">{trainer.archetype}</p>
                )}
              </div>
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-red-600 to-orange-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                <Swords className="w-7 h-7 text-white" />
              </div>
            </div>

            {/* Taunt speech bubble */}
            <div className="relative bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 mb-5">
              <div className="absolute -top-2 left-6 w-4 h-4 bg-slate-800/60 border-l border-t border-slate-700/50 rotate-45" />
              <p className="text-slate-100 text-sm leading-relaxed italic">"{taunt}"</p>
            </div>

            {/* Roster preview */}
            {roster?.length > 0 && (
              <div className="mb-5">
                <p className="text-xs text-slate-400 uppercase tracking-wide mb-2 font-semibold">Their team ({roster.length})</p>
                <div className="flex flex-wrap gap-2">
                  {roster.map((mon, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-1.5 bg-slate-800/50 border border-slate-700/50 rounded-lg px-2.5 py-1.5"
                    >
                      <span className="text-white text-sm font-medium">{mon.species || mon.nickname}</span>
                      <span className="text-slate-400 text-xs">Lv.{mon.level}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CTA */}
            <Button
              onClick={() => { setVisible(false); onBegin?.(); }}
              className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-bold py-3 text-base shadow-lg"
            >
              <Swords className="w-5 h-5 mr-2" />
              Begin Battle!
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}