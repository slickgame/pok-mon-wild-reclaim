import React, { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { getMoveData } from '@/components/utils/getMoveData';

export default function ActionQueuePanel({ playerActive = [], pokemonMap = {}, battleState, onQueueReady }) {
  const [selectedMoves, setSelectedMoves] = useState({});

  const aliveActive = useMemo(
    () => playerActive.filter((id) => (battleState?.hpMap?.[id] ?? 0) > 0),
    [playerActive, battleState]
  );

  const setMove = (pokemonId, moveName) => {
    setSelectedMoves((prev) => ({ ...prev, [pokemonId]: moveName }));
  };

  const ready = aliveActive.length > 0 && aliveActive.every((id) => selectedMoves[id]);

  const buildActions = () => aliveActive.map((id) => {
    const mon = pokemonMap[id];
    const moveName = selectedMoves[id] || mon?.abilities?.[0] || 'Tackle';
    const moveData = getMoveData(moveName, mon) || { name: moveName, target: 'single-opponent', priority: 0 };

    const aliveEnemies = (battleState?.enemyActive || []).filter((enemyId) => (battleState?.hpMap?.[enemyId] ?? 0) > 0);
    const defenderIds = moveData.target === 'all-opponents'
      ? aliveEnemies
      : moveData.target === 'self'
        ? [id]
        : aliveEnemies.slice(0, 1);

    return {
      type: 'move',
      pokemonId: id,
      side: 'player',
      payload: moveData,
      defenderIds
    };
  });

  return (
    <div className="space-y-3">
      {aliveActive.map((id) => {
        const mon = pokemonMap[id];
        const moveList = mon?.abilities || [];
        return (
          <div key={id} className="rounded-lg border border-slate-700 p-3">
            <p className="text-sm text-slate-200 mb-2">{mon?.nickname || mon?.species || 'Pokémon'}</p>
            <div className="flex flex-wrap gap-2">
              {moveList.map((moveName) => (
                <Button
                  key={`${id}-${moveName}`}
                  size="sm"
                  variant={selectedMoves[id] === moveName ? 'default' : 'outline'}
                  onClick={() => setMove(id, moveName)}
                >
                  {moveName}
                </Button>
              ))}
            </div>
          </div>
        );
      })}

      <Button disabled={!ready} onClick={() => onQueueReady(buildActions())} className="w-full">
        Resolve Turn
      </Button>
    </div>
  );
}
