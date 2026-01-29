import React from 'react';
import { Button } from '@/components/ui/button';
import { TrendingUp, RotateCcw } from 'lucide-react';
import PokemonSelector from '@/components/pokemon/PokemonSelector';
import TalentDisplay from '@/components/battle/TalentDisplay';

export default function TalentUpgradeTab({
  pokemon,
  isLoading,
  selectedPokemon,
  onSelectPokemon,
  onUpgradeTalent,
  onFullReset
}) {
  const canUseBondUpgrade = selectedPokemon?.friendship >= 255 && !selectedPokemon?.usedBondUpgrade;

  return (
    <div className="space-y-6">
      <PokemonSelector
        pokemon={pokemon}
        isLoading={isLoading}
        selectedPokemon={selectedPokemon}
        onSelect={onSelectPokemon}
      />

      {selectedPokemon && (
        <div className="glass rounded-xl p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h3 className="text-lg font-semibold text-white">
              {selectedPokemon.nickname || selectedPokemon.species}&apos;s Talents
            </h3>
            <Button
              variant="outline"
              onClick={() => onFullReset(selectedPokemon)}
              className="border-red-500/30 text-red-300 hover:bg-red-500/10"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Full Reset
            </Button>
          </div>

          {selectedPokemon.talents?.length > 0 ? (
            <div className="space-y-4">
              {selectedPokemon.talents.map((talent, index) => (
                <div key={`${selectedPokemon.id}-talent-${index}`} className="glass rounded-lg p-4">
                  <TalentDisplay talents={[talent]} showDescription />
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      onClick={() => onUpgradeTalent(selectedPokemon, index, 'scroll')}
                      className="bg-yellow-600 hover:bg-yellow-700"
                    >
                      <TrendingUp className="w-3 h-3 mr-1" />
                      Upgrade
                    </Button>
                    {canUseBondUpgrade && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onUpgradeTalent(selectedPokemon, index, 'bond')}
                        className="border-pink-500/40 text-pink-200 hover:bg-pink-500/10"
                      >
                        Bond Upgrade
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-400 text-center py-8">
              This Pokémon has no talents yet.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
