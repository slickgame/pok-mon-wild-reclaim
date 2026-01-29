import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import PokemonSelector from '@/components/pokemon/PokemonSelector';
import TalentDisplay from '@/components/battle/TalentDisplay';

export default function TalentRerollTab({
  pokemon,
  isLoading,
  selectedPokemon,
  onSelectPokemon,
  onRequestReroll
}) {
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
              onClick={() => onRequestReroll(selectedPokemon)}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              🎲 Re-Roll Talents (Consumes 1 Talent Crystal)
            </Button>
          </div>

          {selectedPokemon.talents?.length > 0 ? (
            <div className="space-y-3">
              {selectedPokemon.talents.map((talent, index) => (
                <div key={`${selectedPokemon.id}-reroll-${index}`} className="glass rounded-lg p-4">
                  <TalentDisplay talents={[talent]} showDescription />
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
