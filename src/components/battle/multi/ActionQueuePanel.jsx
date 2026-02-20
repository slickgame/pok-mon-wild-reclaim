/**
 * ActionQueuePanel — Step 3
 *
 * For each active player Pokémon, renders action-selection buttons.
 * When all slots have an action locked in, calls onQueueReady(actions[]).
 *
 * Props:
 *   playerActive   string[]           — active player Pokémon IDs
 *   pokemonMap     { [id]: Pokemon }
 *   battleState    object             — multi-active battle state
 *   inventory      Item[]             — player inventory
 *   onQueueReady   (actions[]) => void
 *   isWildBattle   boolean
 *   pokeballCount  number
 */

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Swords, Package, RefreshCw, Trophy, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getMoveData } from '@/components/utils/getMoveData';
import TargetPickerModal from './TargetPickerModal';

export default function ActionQueuePanel({
  playerActive = [],
  pokemonMap = {},
  battleState,
  inventory = [],
  onQueueReady,
  isWildBattle = false,
  pokeballCount = 0,
}) {
  // pendingActions: { [pokemonId]: Action | null }
  const [pendingActions, setPendingActions] = useState({});
  // openMenu: { pokemonId, menuType: 'fight'|'items'|'switch'|'pokeballs' } | null
  const [openMenu, setOpenMenu] = useState(null);
  // targetPickerState: { pokemonId, move } | null
  const [targetPicker, setTargetPicker] = useState(null);

  const enemyActive = battleState?.enemyActive || [];
  const hpMap = battleState?.hpMap || {};

  const lockAction = useCallback((pokemonId, action) => {
    setPendingActions(prev => ({ ...prev, [pokemonId]: action }));
    setOpenMenu(null);
    setTargetPicker(null);
  }, []);

  const clearAction = useCallback((pokemonId) => {
    setPendingActions(prev => { const n = { ...prev }; delete n[pokemonId]; return n; });
  }, []);

  const allLocked = playerActive.length > 0 && playerActive.every(id => pendingActions[id]);

  const handleConfirm = () => {
    if (!allLocked) return;
    onQueueReady(playerActive.map(id => pendingActions[id]));
    setPendingActions({});
    setOpenMenu(null);
  };

  const battleItems = inventory.filter(i => ['Potion', 'Battle Item'].includes(i.type));
  const pokeballs   = inventory.filter(i => i.type === 'Capture Gear');
  const playerBench = (battleState?.playerBench || []).map(id => pokemonMap[id]).filter(Boolean);

  return (
    <div className="space-y-3">
      {/* Per-slot action rows */}
      {playerActive.map(id => {
        const mon = pokemonMap[id];
        if (!mon) return null;
        const action = pendingActions[id];
        const isMenuOpen = openMenu?.pokemonId === id;

        return (
          <motion.div
            key={id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-xl p-3 border border-indigo-500/20"
          >
            {/* Header row */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white text-sm">{mon.nickname || mon.species}</span>
                <Badge className="bg-slate-700 text-xs">Lv.{mon.level}</Badge>
                <span className="text-xs text-slate-400">
                  {hpMap[id] ?? mon.currentHp ?? '?'} HP
                </span>
              </div>
              {action && (
                <button onClick={() => clearAction(id)} className="text-slate-400 hover:text-red-400">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Locked action display */}
            {action && !isMenuOpen && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-500/10 border border-indigo-500/30">
                <Check className="w-4 h-4 text-indigo-400" />
                <span className="text-sm text-indigo-300">
                  {action.type === 'move'   && `Use ${action.payload?.name || 'Move'}`}
                  {action.type === 'item'   && `Use ${action.payload?.itemName || 'Item'}`}
                  {action.type === 'switch' && `Switch → ${pokemonMap[action.payload?.inId]?.nickname || pokemonMap[action.payload?.inId]?.species || '?'}`}
                  {action.type === 'capture' && 'Attempt Capture'}
                  {action.type === 'flee'   && 'Flee'}
                </span>
              </div>
            )}

            {/* Main menu buttons (shown when no action locked) */}
            {!action && !isMenuOpen && (
              <div className="grid grid-cols-4 gap-2">
                <Button
                  size="sm"
                  onClick={() => setOpenMenu({ pokemonId: id, menuType: 'fight' })}
                  className="bg-red-600/80 hover:bg-red-600 text-xs h-9 flex-col gap-0.5"
                >
                  <Swords className="w-3.5 h-3.5" />
                  Fight
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setOpenMenu({ pokemonId: id, menuType: 'items' })}
                  disabled={battleItems.length === 0}
                  className="text-xs h-9 flex-col gap-0.5"
                >
                  <Package className="w-3.5 h-3.5" />
                  Items
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setOpenMenu({ pokemonId: id, menuType: 'switch' })}
                  disabled={playerBench.length === 0}
                  className="text-xs h-9 flex-col gap-0.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Switch
                </Button>
                {isWildBattle && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setOpenMenu({ pokemonId: id, menuType: 'pokeballs' })}
                    disabled={pokeballCount === 0}
                    className="text-xs h-9 flex-col gap-0.5"
                  >
                    <Trophy className="w-3.5 h-3.5" />
                    Ball
                  </Button>
                )}
              </div>
            )}

            {/* Sub-menus */}
            <AnimatePresence>
              {isMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-2 overflow-hidden"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                      {openMenu.menuType === 'fight'    && 'Select Move'}
                      {openMenu.menuType === 'items'    && 'Select Item'}
                      {openMenu.menuType === 'switch'   && 'Switch To'}
                      {openMenu.menuType === 'pokeballs' && 'Select Ball'}
                    </span>
                    <button onClick={() => setOpenMenu(null)} className="text-slate-400 hover:text-white">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Fight sub-menu */}
                  {openMenu.menuType === 'fight' && (
                    <div className="grid grid-cols-2 gap-1.5">
                      {(mon.abilities || []).map((moveName, idx) => {
                        const moveData = getMoveData(moveName, mon);
                        const maxPP = moveData?.pp || 10;
                        const curPP = mon.movePP?.[moveName] !== undefined ? mon.movePP[moveName] : maxPP;
                        return (
                          <button
                            key={idx}
                            disabled={curPP <= 0}
                            onClick={() => {
                              if (!moveData) return;
                              const aliveEnemies = enemyActive.filter(eid => (hpMap[eid] ?? 0) > 0);
                              const targetClass = moveData.target || 'single-opponent';

                              if (targetClass === 'all-opponents') {
                                lockAction(id, { type: 'move', pokemonId: id, side: 'player', payload: moveData, defenderIds: aliveEnemies });
                              } else if (targetClass === 'self') {
                                lockAction(id, { type: 'move', pokemonId: id, side: 'player', payload: moveData, defenderIds: [id] });
                              } else if (aliveEnemies.length === 1) {
                                // Only one target — auto-select, no modal needed
                                lockAction(id, { type: 'move', pokemonId: id, side: 'player', payload: moveData, defenderIds: [aliveEnemies[0]] });
                              } else {
                                // Multiple targets — open picker
                                setTargetPicker({ pokemonId: id, move: moveData });
                              }
                            }}
                            className={`text-left px-2 py-1.5 rounded-lg text-xs font-medium transition-colors
                              ${curPP <= 0 ? 'opacity-40 cursor-not-allowed bg-slate-800' : 'bg-slate-700 hover:bg-slate-600 text-white'}`}
                          >
                            <div className="truncate">{moveName}</div>
                            <div className="text-slate-400 text-[10px]">PP {curPP}/{maxPP}</div>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Items sub-menu */}
                  {openMenu.menuType === 'items' && (
                    <div className="space-y-1">
                      {battleItems.map(item => (
                        <button
                          key={item.id}
                          onClick={() => lockAction(id, {
                            type: 'item',
                            pokemonId: id,
                            side: 'player',
                            payload: { itemId: item.id, itemName: item.name, item }
                          })}
                          className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-xs"
                        >
                          <span>{item.name}</span>
                          <Badge className="bg-slate-600 text-xs">×{item.quantity || 1}</Badge>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Switch sub-menu */}
                  {openMenu.menuType === 'switch' && (
                    <div className="space-y-1">
                      {playerBench.map(benchMon => {
                        const benchHp = hpMap[benchMon.id] ?? benchMon.currentHp ?? 0;
                        const fainted  = benchHp <= 0;
                        return (
                          <button
                            key={benchMon.id}
                            disabled={fainted}
                            onClick={() => lockAction(id, {
                              type: 'switch',
                              pokemonId: id,
                              side: 'player',
                              payload: { outId: id, inId: benchMon.id }
                            })}
                            className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-xs
                              ${fainted ? 'opacity-40 cursor-not-allowed bg-slate-800 text-slate-500' : 'bg-slate-700 hover:bg-slate-600 text-white'}`}
                          >
                            <span>{benchMon.nickname || benchMon.species}{fainted ? ' (Fainted)' : ''}</span>
                            <Badge className="bg-slate-600">Lv.{benchMon.level}</Badge>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Pokéballs sub-menu */}
                  {openMenu.menuType === 'pokeballs' && (
                    <div className="space-y-1">
                      {pokeballs.map(ball => (
                        <button
                          key={ball.id}
                          onClick={() => lockAction(id, {
                            type: 'capture',
                            pokemonId: id,
                            side: 'player',
                            payload: { ball }
                          })}
                          className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-xs"
                        >
                          <span>{ball.name}</span>
                          <Badge className="bg-purple-700 text-xs">×{ball.quantity || 1}</Badge>
                        </button>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}

      {/* Confirm button */}
      <AnimatePresence>
        {allLocked && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <Button
              onClick={handleConfirm}
              className="w-full bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 font-semibold"
            >
              <Swords className="w-4 h-4 mr-2" />
              Execute Turn ({playerActive.length} action{playerActive.length > 1 ? 's' : ''})
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Target picker modal */}
      {targetPicker && (
        <TargetPickerModal
          move={targetPicker.move}
          attackerName={pokemonMap[targetPicker.pokemonId]?.nickname || pokemonMap[targetPicker.pokemonId]?.species}
          enemyActive={enemyActive}
          pokemonMap={pokemonMap}
          hpMap={hpMap}
          onSelect={(defenderIds) => {
            lockAction(targetPicker.pokemonId, {
              type: 'move',
              pokemonId: targetPicker.pokemonId,
              side: 'player',
              payload: targetPicker.move,
              defenderIds
            });
          }}
          onCancel={() => setTargetPicker(null)}
        />
      )}
    </div>
  );
}