import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Backpack, Search, Package, Beaker, Target, Sparkles, Key, Swords, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import PageHeader from '@/components/common/PageHeader';
import ItemCard from '@/components/inventory/ItemCard';
import TMUsageModal from '@/components/items/TMUsageModal';
import { checkEvolution, evolvePokemon } from '@/components/pokemon/evolutionData';
import { getPokemonStats } from '@/components/pokemon/usePokemonStats';
import { calculateAllStats } from '@/components/pokemon/statCalculations';
import { getBaseStats } from '@/components/pokemon/baseStats';

const itemTypes = [
  { value: 'all', label: 'All', icon: Package },
  { value: 'Potion', label: 'Potions', icon: Beaker },
  { value: 'Capture Gear', label: 'Pokéballs', icon: Target },
  { value: 'Battle Item', label: 'Battle', icon: Swords },
  { value: 'Held Item', label: 'Held', icon: Sparkles },
  { value: 'Material', label: 'Materials', icon: Package },
  { value: 'Key Item', label: 'Key Items', icon: Key },
];

export default function InventoryPage() {
  const [selectedItem, setSelectedItem] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [tmModalItem, setTmModalItem] = useState(null);
  const queryClient = useQueryClient();

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['items'],
    queryFn: () => base44.entities.Item.list()
  });


  const { data: teamPokemon = [] } = useQuery({
    queryKey: ['playerPokemonInventoryUse'],
    queryFn: () => base44.entities.Pokemon.filter({ isInTeam: true })
  });

  const consumeItemInstance = async (item) => {
    if (!item) return;
    const targetId = item._ids?.[0] || item.id;
    if (!targetId) return;

    const original = items.find((entry) => entry.id === targetId);
    const quantity = original?.quantity || item.quantity || 1;

    if (quantity > 1) {
      await base44.entities.Item.update(targetId, { quantity: quantity - 1 });
    } else {
      await base44.entities.Item.delete(targetId);
    }
  };

  const useItemMutation = useMutation({
    mutationFn: async (item) => {
      const primary = teamPokemon[0];
      if (!primary) throw new Error('No team Pokémon available to use this item.');

      const normalizedName = item.name?.trim();
      const pokemonStats = getPokemonStats(primary);
      const maxHp = pokemonStats?.stats?.maxHp || primary?.stats?.maxHp || primary?.stats?.hp || 100;
      const currentHp = primary.currentHp ?? maxHp;

      const vitaminMap = {
        'HP Up': 'hp',
        Protein: 'atk',
        Iron: 'def',
        Calcium: 'spAtk',
        Zinc: 'spDef',
        Carbos: 'spd'
      };

      const expCandyLevels = {
        'EXP Candy S': 1,
        'EXP Candy M': 2,
        'EXP Candy L': 4,
        'EXP Candy XL': 8,
        'Rare Candy': 1
      };

      if (item.type === 'Capture Gear') {
        alert(`${item.name} can be used during wild battles from the Items/Pokéballs menu.`);
        return;
      }

      if (item.type === 'TM') {
        setTmModalItem(item);
        return;
      }

      if (normalizedName === 'Potion' || normalizedName === 'Super Potion' || normalizedName === 'Hyper Potion' || normalizedName === 'Max Potion') {
        const healByName = { Potion: 50, 'Super Potion': 100, 'Hyper Potion': 200, 'Max Potion': maxHp };
        const healAmount = healByName[normalizedName] || 0;
        await base44.entities.Pokemon.update(primary.id, {
          currentHp: Math.min(maxHp, currentHp + healAmount)
        });
        await consumeItemInstance(item);
        alert(`${primary.nickname || primary.species} recovered HP.`);
        return;
      }

      if (normalizedName === 'Revive' || normalizedName === 'Max Revive') {
        const fainted = teamPokemon.find((mon) => (mon.currentHp ?? (getPokemonStats(mon)?.stats?.maxHp || 0)) <= 0);
        if (!fainted) throw new Error('No fainted team Pokémon to revive.');
        const faintedStats = getPokemonStats(fainted);
        const faintedMax = faintedStats?.stats?.maxHp || fainted?.stats?.maxHp || 100;
        await base44.entities.Pokemon.update(fainted.id, {
          currentHp: normalizedName === 'Max Revive' ? faintedMax : Math.max(1, Math.floor(faintedMax * 0.5))
        });
        await consumeItemInstance(item);
        alert(`${fainted.nickname || fainted.species} was revived.`);
        return;
      }

      if (normalizedName === 'Antidote') {
        await base44.entities.Pokemon.update(primary.id, { status: null, statusCondition: null });
        await consumeItemInstance(item);
        alert(`${primary.nickname || primary.species} was cured of status ailments.`);
        return;
      }

      if (vitaminMap[normalizedName]) {
        const key = vitaminMap[normalizedName];
        const evs = { hp: 0, atk: 0, def: 0, spAtk: 0, spDef: 0, spd: 0, ...(primary.evs || {}) };
        evs[key] = Math.min(252, (evs[key] || 0) + 10);
        const baseStats = getBaseStats(primary.species);
        const recalculated = calculateAllStats({ ...primary, evs }, baseStats);
        await base44.entities.Pokemon.update(primary.id, { evs, stats: recalculated });
        await consumeItemInstance(item);
        alert(`${primary.nickname || primary.species}'s training improved.`);
        return;
      }

      if (expCandyLevels[normalizedName]) {
        const levelIncrease = expCandyLevels[normalizedName];
        const nextLevel = Math.min(100, (primary.level || 1) + levelIncrease);
        const baseStats = getBaseStats(primary.species);
        const recalculated = calculateAllStats({ ...primary, level: nextLevel }, baseStats);
        await base44.entities.Pokemon.update(primary.id, {
          level: nextLevel,
          stats: recalculated,
          currentHp: Math.min(primary.currentHp ?? recalculated.maxHp, recalculated.maxHp)
        });
        await consumeItemInstance(item);
        alert(`${primary.nickname || primary.species} grew to level ${nextLevel}.`);
        return;
      }

      if (normalizedName === 'Modest Mint') {
        const baseStats = getBaseStats(primary.species);
        const recalculated = calculateAllStats({ ...primary, nature: 'Modest' }, baseStats);
        await base44.entities.Pokemon.update(primary.id, { nature: 'Modest', stats: recalculated });
        await consumeItemInstance(item);
        alert(`${primary.nickname || primary.species} became Modest.`);
        return;
      }

      if (normalizedName === 'Ability Patch') {
        await base44.entities.Pokemon.update(primary.id, { hasHiddenAbility: true });
        await consumeItemInstance(item);
        alert(`${primary.nickname || primary.species} unlocked a hidden ability.`);
        return;
      }

      if (normalizedName === 'Ability Capsule') {
        await base44.entities.Pokemon.update(primary.id, { abilityCapsuleUsedAt: new Date().toISOString() });
        await consumeItemInstance(item);
        alert('Ability Capsule applied.');
        return;
      }

      if (normalizedName === 'Bottle Cap' || normalizedName === 'Gold Bottle Cap') {
        await base44.entities.Pokemon.update(primary.id, {
          hyperTraining: {
            ...(primary.hyperTraining || {}),
            [normalizedName === 'Gold Bottle Cap' ? 'all' : 'single']: true,
            updatedAt: new Date().toISOString()
          }
        });
        await consumeItemInstance(item);
        alert('Hyper Training applied.');
        return;
      }

      if (['Choice Band', 'Choice Specs', 'Choice Scarf', 'Leftovers'].includes(normalizedName)) {
        await base44.entities.Pokemon.update(primary.id, {
          heldItem: { name: normalizedName, equippedAt: new Date().toISOString() }
        });
        await consumeItemInstance(item);
        alert(`${normalizedName} equipped to ${primary.nickname || primary.species}.`);
        return;
      }

      if (item.type === 'evolution' || /Stone$/.test(normalizedName || '')) {
        const candidate = teamPokemon.find((mon) => checkEvolution(mon, null, normalizedName)?.canEvolve);
        if (!candidate) throw new Error(`No team Pokémon can evolve with ${normalizedName}.`);
        const evo = checkEvolution(candidate, null, normalizedName);
        const evolved = evolvePokemon(candidate, evo.evolvesInto);
        await base44.entities.Pokemon.update(candidate.id, evolved);
        await consumeItemInstance(item);
        alert(`${candidate.nickname || candidate.species} evolved into ${evo.evolvesInto}!`);
        return;
      }

      if (item.type === 'Battle Item') {
        await consumeItemInstance(item);
        alert(`${item.name} was used.`);
        return;
      }

      throw new Error('This item has no implemented use flow yet.');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
      queryClient.invalidateQueries({ queryKey: ['playerPokemon'] });
      queryClient.invalidateQueries({ queryKey: ['playerPokemonInventoryUse'] });
    },
    onError: (error) => {
      alert(error.message || 'Failed to use item.');
    }
  });
  // Group items by name to combine duplicates
  const stackedItems = {};
  items.forEach(item => {
    const key = item.name; // Group by item name
    if (!stackedItems[key]) {
      stackedItems[key] = {
        ...item,
        quantity: item.quantity || 1,
        _ids: [item.id] // Track all IDs for this stack
      };
    } else {
      stackedItems[key].quantity += (item.quantity || 1);
      stackedItems[key]._ids.push(item.id);
    }
  });

  const filteredItems = Object.values(stackedItems).filter(item => {
    const matchesType = filter === 'all' || item.type === filter;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const groupedItems = filteredItems.reduce((acc, item) => {
    if (!acc[item.type]) acc[item.type] = [];
    acc[item.type].push(item);
    return acc;
  }, {});

  const totalItems = Object.values(stackedItems).reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div>
      <PageHeader 
        title="Inventory" 
        subtitle={`${totalItems} items total`}
        icon={Backpack}
        action={
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-slate-800/50 border-slate-700 w-48"
            />
          </div>
        }
      />

      {/* Filter Tabs */}
      <div className="mb-6 overflow-x-auto pb-2">
        <div className="flex gap-2 min-w-max">
          {itemTypes.map((type) => (
            <Button
              key={type.value}
              variant="ghost"
              size="sm"
              onClick={() => setFilter(type.value)}
              className={`rounded-full ${
                filter === type.value 
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/50' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <type.icon className="w-4 h-4 mr-2" />
              {type.label}
            </Button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
          {[...Array(16)].map((_, i) => (
            <Skeleton key={i} className="aspect-square bg-slate-800" />
          ))}
        </div>
      ) : filteredItems.length > 0 ? (
        filter === 'all' ? (
          <div className="space-y-6">
            {Object.entries(groupedItems).map(([type, typeItems]) => (
              <motion.div 
                key={type}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h3 className="text-sm font-semibold text-slate-400 mb-3 flex items-center gap-2">
                  {type}
                  <Badge className="bg-slate-700/50 text-slate-300">{typeItems.length}</Badge>
                </h3>
                <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                  {typeItems.map((item) => (
                    <ItemCard 
                      key={item.id} 
                      item={item} 
                      onClick={() => setSelectedItem(item)}
                      selected={selectedItem?.id === item.id}
                    />
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div 
            className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {filteredItems.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.02 }}
              >
                <ItemCard 
                  item={item} 
                  onClick={() => setSelectedItem(item)}
                  selected={selectedItem?.id === item.id}
                />
              </motion.div>
            ))}
          </motion.div>
        )
      ) : (
        <div className="glass rounded-xl p-12 text-center">
          <Backpack className="w-16 h-16 mx-auto mb-4 text-slate-600" />
          <h3 className="text-xl font-semibold text-white mb-2">Inventory Empty</h3>
          <p className="text-slate-400">Explore zones and craft items to fill your bag!</p>
        </div>
      )}

      {/* Item Detail Sheet */}
      <Sheet open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <SheetContent className="bg-slate-900 border-slate-800 w-full sm:max-w-md">
          {selectedItem && (
            <ItemDetailView 
              item={selectedItem} 
              onClose={() => setSelectedItem(null)}
              onUseTM={(item) => {
                setTmModalItem(item);
                setSelectedItem(null);
              }}
              onUseItem={(item) => useItemMutation.mutate(item)}
            />
          )}
        </SheetContent>
      </Sheet>

      {/* TM Usage Modal */}
      {tmModalItem && (
        <TMUsageModal
          tmItem={tmModalItem}
          onUse={async (item) => {
            // Consume TM
            if (item.quantity > 1) {
              await base44.entities.Item.update(item.id, { quantity: item.quantity - 1 });
            } else {
              await base44.entities.Item.delete(item.id);
            }
          }}
          onClose={() => setTmModalItem(null)}
        />
      )}
    </div>
  );
}

function ItemDetailView({ item, onClose, onUseTM, onUseItem }) {
  const typeIcons = {
    'Potion': Beaker,
    'Bait': Target,
    'Held Item': Sparkles,
    'Material': Package,
    'Key Item': Key,
    'Battle Item': Swords,
  };

  const rarityColors = {
    'Common': 'from-slate-500 to-slate-600',
    'Uncommon': 'from-green-500 to-emerald-600',
    'Rare': 'from-blue-500 to-cyan-600',
    'Epic': 'from-purple-500 to-violet-600',
    'Legendary': 'from-yellow-500 to-amber-600',
  };

  const Icon = typeIcons[item.type] || Package;
  const gradient = rarityColors[item.rarity] || 'from-slate-500 to-slate-600';

  return (
    <div className="pt-6">
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={onClose}
        className="absolute top-4 right-4 text-slate-400 hover:text-white"
      >
        <X className="w-5 h-5" />
      </Button>

      {/* Icon */}
      <div className="flex justify-center mb-6">
        <div className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${gradient} p-1`}>
          <div className="w-full h-full rounded-xl bg-slate-900/80 flex items-center justify-center">
            {item.iconUrl ? (
              <img src={item.iconUrl} alt={item.name} className="w-16 h-16 object-contain" />
            ) : (
              <Icon className="w-10 h-10 text-white/70" />
            )}
          </div>
        </div>
      </div>

      {/* Name & Badges */}
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-white mb-2">{item.name}</h2>
        <div className="flex justify-center gap-2">
          <Badge className="bg-slate-700/50 text-slate-300">{item.type}</Badge>
          <Badge className={`bg-gradient-to-r ${gradient} text-white border-0`}>
            {item.rarity}
          </Badge>
          <Badge className="bg-slate-700/50 text-slate-300">Tier {item.tier}</Badge>
        </div>
      </div>

      {/* Quantity */}
      {item.quantity > 1 && (
        <div className="glass rounded-xl p-4 mb-4 text-center">
          <p className="text-slate-400 text-sm">Quantity</p>
          <p className="text-2xl font-bold text-white">{item.quantity}</p>
        </div>
      )}

      {/* Description */}
      {item.description && (
        <div className="glass rounded-xl p-4 mb-4">
          <h3 className="text-sm font-semibold text-white mb-2">Description</h3>
          <p className="text-slate-300 text-sm">{item.description}</p>
        </div>
      )}

      {/* Effects */}
      {item.effects && (
        <div className="glass rounded-xl p-4 mb-4">
          <h3 className="text-sm font-semibold text-white mb-2">Effects</h3>
          <p className="text-emerald-400 text-sm">{item.effects}</p>
        </div>
      )}

      {/* Value */}
      {item.sellValue > 0 && (
        <div className="glass rounded-xl p-4">
          <div className="flex justify-between items-center">
            <span className="text-slate-400 text-sm">Sell Value</span>
            <span className="text-amber-400 font-semibold">💰 {item.sellValue}</span>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 mt-6">
        <Button variant="outline" className="flex-1 border-slate-700 text-slate-300">
          Drop
        </Button>
        <Button 
          className="flex-1 bg-gradient-to-r from-indigo-500 to-cyan-500"
          onClick={() => {
            // Check if it's a TM item
            if (item.type === 'TM' || item.name.match(/TM\d+/i) || item.name.startsWith('HM:')) {
              onUseTM(item);
            } else {
              onUseItem(item);
            }
          }}
        >
          Use
        </Button>
      </div>
    </div>
  );
}