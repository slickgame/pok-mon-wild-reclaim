import React, { useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Trophy, MapPin, Calendar, TrendingUp, Shield, Heart, Zap, ArrowRight, HelpCircle } from 'lucide-react';
import StatDisplay from '@/components/pokemon/StatDisplay';
import { getLevelUpLearnset } from '@/components/pokemon/levelUpLearnsets';
import { getMoveData } from '@/components/utils/getMoveData';
import MoveTagBadges from '@/components/moves/MoveTagBadges';
import { getMatchingTalents } from '@/components/utils/moveTalentUtils';

export default function PokedexDetailView({ species, pokemon = null }) {
  const roleIcons = {
    Tank: Shield,
    Striker: Zap,
    Support: Heart,
    Medic: Heart,
    Scout: Zap,
    Juggernaut: Shield
  };

  const RoleIcon = roleIcons[species.role];

  if (!species.seen) {
    return (
      <div className="py-12 text-center">
        <HelpCircle className="w-20 h-20 mx-auto mb-4 text-slate-600" />
        <h3 className="text-xl font-bold text-white mb-2">Unknown Pokémon</h3>
        <p className="text-slate-400">Encounter this Pokémon to unlock its data</p>
      </div>
    );
  }

  const learnsetEntries = useMemo(() => {
    const learnset = getLevelUpLearnset(species.species);
    return Object.entries(learnset)
      .map(([level, moves]) => ({ level: Number(level), moves }))
      .sort((a, b) => a.level - b.level);
  }, [species.species]);

  return (
    <div className="space-y-6 pt-6">
      {/* Header */}
      <div className="text-center">
        <div className="text-sm font-mono text-slate-500 mb-2">
          #{String(species.dexNumber).padStart(3, '0')}
        </div>
        
        {/* Sprite */}
        <div className="flex justify-center mb-4">
          {species.spriteUrl ? (
            <img
              src={species.spriteUrl}
              alt={species.species}
              className="w-32 h-32 object-contain"
            />
          ) : (
            <div className="w-32 h-32 rounded-full bg-slate-800 flex items-center justify-center">
              <span className="text-5xl">?</span>
            </div>
          )}
        </div>

        <h2 className="text-2xl font-bold text-white mb-2">{species.species}</h2>
        
        {/* Status Badge */}
        <div className="flex items-center justify-center gap-2 mb-4">
          {species.caught ? (
            <Badge className="bg-green-500">
              <Trophy className="w-3 h-3 mr-1" />
              Caught
            </Badge>
          ) : (
            <Badge className="bg-blue-500">Seen</Badge>
          )}
          <Badge variant="outline">{species.evolutionStage}</Badge>
        </div>
      </div>

      {/* Types and Role */}
      <div className="glass rounded-lg p-4">
        <h3 className="text-sm font-semibold text-white mb-3">Classification</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-400">Type</span>
            <div className="flex gap-2">
              {species.types.map(type => (
                <Badge key={type} className="bg-slate-700">{type}</Badge>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-400">Role</span>
            <div className="flex items-center gap-2">
              {RoleIcon && <RoleIcon className="w-4 h-4 text-indigo-400" />}
              <Badge className="bg-indigo-600">{species.role}</Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Base Stats */}
      <div className="glass rounded-lg p-4">
        <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-indigo-400" />
          Base Stats
        </h3>
        <StatDisplay stats={species.baseStats} showBars />
      </div>

      {/* Evolution */}
      {species.evolution && (
        <div className="glass rounded-lg p-4">
          <h3 className="text-sm font-semibold text-white mb-3">Evolution</h3>
          <div className="flex items-center justify-center gap-3">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-2">
                <span className="text-sm">{species.species}</span>
              </div>
            </div>
            
            <div className="flex flex-col items-center">
              <ArrowRight className="w-5 h-5 text-indigo-400 mb-1" />
              <div className="text-xs text-slate-400 text-center">
                {species.evolution.method === 'Level' && `Lv. ${species.evolution.level}`}
                {species.evolution.method === 'Item' && species.evolution.item}
                {species.evolution.method === 'Various' && 'Multiple'}
              </div>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-2">
                <span className="text-xs text-center px-1">
                  {species.evolution.evolvesTo}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Capture Info */}
      {species.caught && (
        <div className="glass rounded-lg p-4">
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-yellow-400" />
            Capture Record
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Times Caught</span>
              <span className="text-white font-semibold">{species.caughtCount}</span>
            </div>
            {species.firstCaughtLocation && (
              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  First Location
                </span>
                <span className="text-white">{species.firstCaughtLocation}</span>
              </div>
            )}
            {species.firstCaughtLevel && (
              <div className="flex items-center justify-between">
                <span className="text-slate-400">First Level</span>
                <span className="text-white">Lv. {species.firstCaughtLevel}</span>
              </div>
            )}
            {species.firstCaughtAt && (
              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  First Caught
                </span>
                <span className="text-white text-xs">
                  {new Date(species.firstCaughtAt).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Move Tags */}
      <div className="glass rounded-lg p-4">
        <h3 className="text-sm font-semibold text-white mb-3">Move Tags</h3>
        {learnsetEntries.length === 0 ? (
          <p className="text-sm text-slate-400">No learnset data recorded yet.</p>
        ) : (
          <div className="space-y-3">
            {learnsetEntries.map(({ level, moves }) => (
              <div key={level} className="rounded-lg border border-slate-700/60 p-3">
                <div className="text-xs text-slate-400 mb-2">Level {level}</div>
                <div className="space-y-2">
                  {moves.map((moveName) => {
                    const moveData = getMoveData(moveName);
                    const matchingTalents = getMatchingTalents(moveData || {}, pokemon?.talents || []);
                    return (
                      <div key={moveName} className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm text-white font-medium">{moveName}</span>
                          <span className="text-[0.7rem] text-slate-400">Tags:</span>
                          <MoveTagBadges tags={moveData?.tags} />
                        </div>
                        {matchingTalents.length > 0 && (
                          <div className="text-xs text-emerald-300">
                            <strong>Talent Synergy:</strong>
                            <ul className="mt-1 space-y-1">
                              {matchingTalents.map((talent) => (
                                <li key={`${moveName}-${talent.id}`}>
                                  ✅ Boosted by {talent.name}{talent.grade ? ` (${talent.grade})` : ''}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
