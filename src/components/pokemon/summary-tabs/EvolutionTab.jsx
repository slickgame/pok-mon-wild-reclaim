import React from 'react';
import { Sparkles, ArrowRight, CheckCircle, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { checkEvolution } from '../evolutionData';

export default function EvolutionTab({ pokemon }) {
  const evolutionCheck = checkEvolution(pokemon);

  if (!evolutionCheck) {
    return (
      <div className="glass rounded-xl p-12 text-center">
        <Sparkles className="w-16 h-16 mx-auto mb-4 text-slate-600" />
        <h3 className="text-lg font-semibold text-white mb-2">Fully Evolved</h3>
        <p className="text-slate-400">
          {pokemon.species} is at its final evolution stage!
        </p>
      </div>
    );
  }

  const { canEvolve, evolvesTo, method, requirement, reason } = evolutionCheck;

  return (
    <div className="space-y-4">
      {/* Evolution Preview */}
      <div className="glass rounded-xl p-6">
        <div className="flex items-center justify-center gap-6">
          {/* Current Form */}
          <div className="text-center">
            <div className="w-24 h-24 rounded-full bg-slate-800 flex items-center justify-center mb-3">
              {pokemon.spriteUrl ? (
                <img
                  src={pokemon.spriteUrl}
                  alt={pokemon.species}
                  className="w-20 h-20 object-contain"
                />
              ) : (
                <span className="text-2xl">{pokemon.species[0]}</span>
              )}
            </div>
            <p className="font-semibold text-white">{pokemon.species}</p>
            <Badge className="mt-1 bg-slate-700">Current</Badge>
          </div>

          {/* Arrow */}
          <div className="flex flex-col items-center">
            <ArrowRight className="w-8 h-8 text-indigo-400 mb-2" />
            <Badge variant="outline" className="text-xs">
              {method}
            </Badge>
          </div>

          {/* Next Form */}
          <div className="text-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border-2 border-indigo-500/30 flex items-center justify-center mb-3">
              <Sparkles className="w-12 h-12 text-indigo-400" />
            </div>
            <p className="font-semibold text-white">{evolvesTo}</p>
            <Badge className="mt-1 bg-indigo-600">Next</Badge>
          </div>
        </div>
      </div>

      {/* Evolution Requirements */}
      <div className="glass rounded-xl p-4">
        <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          Evolution Requirements
        </h3>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-400">Method</span>
            <Badge variant="outline">{method}</Badge>
          </div>

          {method === 'Level' && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">Required Level</span>
              <div className="flex items-center gap-2">
                <span className="text-white font-semibold">Lv. {requirement}</span>
                {pokemon.level >= requirement ? (
                  <CheckCircle className="w-4 h-4 text-green-400" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-400" />
                )}
              </div>
            </div>
          )}

          {method === 'Item' && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">Required Item</span>
              <Badge className="bg-purple-500/20 border-purple-500/30">
                {requirement}
              </Badge>
            </div>
          )}

          {method === 'Happiness' && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">Requirement</span>
              <Badge className="bg-pink-500/20 border-pink-500/30">
                High Happiness
              </Badge>
            </div>
          )}
        </div>

        {/* Status Message */}
        <div className={`mt-4 p-3 rounded-lg border ${
          canEvolve 
            ? 'bg-green-500/10 border-green-500/30' 
            : 'bg-slate-800/50 border-slate-700'
        }`}>
          <div className="flex items-center gap-2">
            {canEvolve ? (
              <CheckCircle className="w-4 h-4 text-green-400" />
            ) : (
              <XCircle className="w-4 h-4 text-slate-400" />
            )}
            <span className={`text-sm ${canEvolve ? 'text-green-300' : 'text-slate-400'}`}>
              {reason}
            </span>
          </div>
        </div>

        {canEvolve && (
          <Button className="w-full mt-4 bg-gradient-to-r from-indigo-500 to-purple-500">
            <Sparkles className="w-4 h-4 mr-2" />
            Evolve Now!
          </Button>
        )}
      </div>

      {/* Info */}
      <div className="glass rounded-xl p-4">
        <h4 className="text-xs font-semibold text-white mb-2">About Evolution</h4>
        <p className="text-xs text-slate-400">
          Evolution occurs after winning battles when requirements are met. 
          You can cancel evolution by pressing the B key if you want to keep your Pokémon in its current form.
        </p>
      </div>
    </div>
  );
}