import React, { useState } from 'react';
import { Shield, Plus, X, Sprout } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';

// Official berry held-item effects
const BERRY_EFFECTS = {
  'Oran Berry': 'Restores 10 HP when HP falls below 50%.',
  'Sitrus Berry': 'Restores 25% max HP when HP falls below 50%.',
  'Lum Berry': 'Cures any status condition once.',
  'Pecha Berry': 'Cures Poison status once.',
  'Cheri Berry': 'Cures Paralysis status once.',
  'Rawst Berry': 'Cures Burn status once.',
  'Aspear Berry': 'Cures Freeze status once.',
  'Persim Berry': 'Cures Confusion once.',
  'Leppa Berry': 'Restores 10 PP to the first move with 0 PP.',
  'Wiki Berry': 'Restores 1/3 max HP when HP falls below 25%. May cause confusion.',
  'Iapapa Berry': 'Restores 1/3 max HP when HP falls below 25%. May cause confusion.',
  'Liechi Berry': '+1 Attack when HP falls below 25%.',
  'Ganlon Berry': '+1 Defense when HP falls below 25%.',
  'Salac Berry': '+1 Speed when HP falls below 25%.',
  'Petaya Berry': '+1 Sp. Atk when HP falls below 25%.',
  'Apicot Berry': '+1 Sp. Def when HP falls below 25%.',
};

export default function ItemsTab({ pokemon }) {
  const [showPicker, setShowPicker] = useState(null); // slot index
  const [saving, setSaving] = useState(false);
  const [localHeldItems, setLocalHeldItems] = useState(pokemon.heldItems || []);
  const queryClient = useQueryClient();

  // Keep local state in sync when pokemon prop changes
  React.useEffect(() => {
    setLocalHeldItems(pokemon.heldItems || []);
  }, [pokemon.heldItems]);

  const { data: inventoryItems = [] } = useQuery({
    queryKey: ['items'],
    queryFn: () => base44.entities.Item.list(),
    staleTime: 10000
  });

  const maxSlots = 3;
  const currentItems = localHeldItems;

  // Items that can be held: Held Items + Berries (not seeds)
  const equippable = inventoryItems.filter(item =>
    item.type === 'Held Item' ||
    item.type === 'Consumable' ||
    (item.name?.includes('Berry') && !item.name?.includes('Seed'))
  );

  const handleEquip = async (slotIndex, itemName) => {
    setSaving(true);
    setShowPicker(null);
    const updated = [...localHeldItems];
    while (updated.length <= slotIndex) updated.push(null);
    updated[slotIndex] = itemName;
    const cleaned = updated.filter(Boolean);
    setLocalHeldItems(cleaned); // optimistic update
    try {
      await base44.entities.Pokemon.update(pokemon.id, { heldItems: cleaned });
      queryClient.invalidateQueries({ queryKey: ['allPokemon'] });
      queryClient.invalidateQueries({ queryKey: ['pokemon'] });
    } catch (e) {
      setLocalHeldItems(pokemon.heldItems || []); // revert on error
    } finally {
      setSaving(false);
    }
  };

  const handleUnequip = async (slotIndex) => {
    setSaving(true);
    const updated = localHeldItems.filter((_, i) => i !== slotIndex);
    setLocalHeldItems(updated); // optimistic update
    try {
      await base44.entities.Pokemon.update(pokemon.id, { heldItems: updated });
      queryClient.invalidateQueries({ queryKey: ['allPokemon'] });
      queryClient.invalidateQueries({ queryKey: ['pokemon'] });
    } catch (e) {
      setLocalHeldItems(pokemon.heldItems || []); // revert on error
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Shield className="w-4 h-4 text-indigo-400" />
        <h3 className="text-sm font-semibold text-white">
          Held Items ({currentItems.length}/{maxSlots})
        </h3>
      </div>

      {/* Item Slots */}
      <div className="grid grid-cols-3 gap-3">
        {[0, 1, 2].map((slotIndex) => {
          const itemName = currentItems[slotIndex];
          return (
            <div
              key={slotIndex}
              className={`aspect-square rounded-lg border-2 ${
                itemName
                  ? 'border-indigo-500/40 bg-indigo-500/10'
                  : 'border-dashed border-slate-700 bg-slate-800/50'
              } flex flex-col items-center justify-center p-2 relative group`}
            >
              {itemName ? (
                <>
                  <div className="text-2xl mb-1">
                    {Object.keys(BERRY_EFFECTS).includes(itemName) ? '🍒' : '💎'}
                  </div>
                  <p className="text-[11px] text-white text-center leading-tight">{itemName}</p>
                  <button
                    onClick={() => handleUnequip(slotIndex)}
                    disabled={saving}
                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500/80 hover:bg-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3 text-white" />
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setShowPicker(slotIndex)}
                  disabled={saving}
                  className="w-full h-full flex flex-col items-center justify-center hover:bg-slate-700/30 transition-colors rounded-lg"
                >
                  <Plus className="w-5 h-5 text-slate-600 mb-1" />
                  <p className="text-[10px] text-slate-600">Slot {slotIndex + 1}</p>
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Item Picker */}
      {showPicker !== null && (
        <div className="rounded-lg border border-indigo-500/30 bg-slate-800/80 p-3 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-white">Choose an item for slot {showPicker + 1}</p>
            <Button size="sm" variant="ghost" onClick={() => setShowPicker(null)} className="h-6 w-6 p-0">
              <X className="w-4 h-4" />
            </Button>
          </div>
          {equippable.length > 0 ? (
            <div className="max-h-48 overflow-y-auto space-y-1">
              {equippable.map(item => (
                <button
                  key={item.id}
                  onClick={() => handleEquip(showPicker, item.name)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-slate-700/50 hover:bg-slate-700 transition-colors text-left"
                >
                  <div>
                    <p className="text-white text-sm">{item.name}</p>
                    {BERRY_EFFECTS[item.name] && (
                      <p className="text-xs text-emerald-400 flex items-center gap-1">
                        <Sprout className="w-3 h-3" /> {BERRY_EFFECTS[item.name]}
                      </p>
                    )}
                  </div>
                  <Badge className="bg-slate-600 text-slate-300 text-xs">×{item.quantity || 1}</Badge>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500">No equippable items in inventory.</p>
          )}
        </div>
      )}

      {/* Active Effects */}
      {currentItems.length > 0 && (
        <div className="glass rounded-xl p-3">
          <h4 className="text-sm font-semibold text-white mb-2">Active Effects</h4>
          <div className="space-y-1">
            {currentItems.map((itemName, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <Badge className="bg-indigo-600/60 text-xs whitespace-nowrap">{itemName}</Badge>
                <p className="text-xs text-slate-400">
                  {BERRY_EFFECTS[itemName] || 'Provides battle bonuses and synergies.'}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="glass rounded-xl p-3">
        <h4 className="text-xs font-semibold text-white mb-1">Berries as Held Items</h4>
        <p className="text-xs text-slate-400">
          Berries equipped as held items are consumed automatically during battle when their condition is triggered, just like in the official games.
        </p>
      </div>
    </div>
  );
}