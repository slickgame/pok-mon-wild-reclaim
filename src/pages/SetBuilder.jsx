import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Sparkles, Filter, Search, Trophy } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import PageHeader from '@/components/common/PageHeader';
import ItemSetCard from '@/components/items/ItemSetCard';
import SetBonusDisplay from '@/components/items/SetBonusDisplay';

export default function SetBuilderPage() {
  const [selectedSet, setSelectedSet] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [rarityFilter, setRarityFilter] = useState('all');

  const { data: itemSets = [], isLoading } = useQuery({
    queryKey: ['itemSets'],
    queryFn: () => base44.entities.ItemSet.list()
  });

  const { data: playerItems = [] } = useQuery({
    queryKey: ['inventory'],
    queryFn: () => base44.entities.Item.filter({ type: 'Held Item' })
  });

  const getOwnedPieces = (setKey) => {
    return playerItems.filter(item => item.setKey === setKey);
  };

  const filteredSets = itemSets.filter(set => {
    const matchesSearch = set.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         set.theme?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRarity = rarityFilter === 'all' || set.rarity === rarityFilter;
    return matchesSearch && matchesRarity;
  });

  const completedSets = filteredSets.filter(set => {
    const owned = getOwnedPieces(set.setKey);
    return owned.length >= (set.totalPieces || 3);
  });

  const incompleteSets = filteredSets.filter(set => {
    const owned = getOwnedPieces(set.setKey);
    return owned.length > 0 && owned.length < (set.totalPieces || 3);
  });

  const undiscoveredSets = filteredSets.filter(set => {
    const owned = getOwnedPieces(set.setKey);
    return owned.length === 0 && !set.isDiscovered;
  });

  return (
    <div>
      <PageHeader 
        title="Set Builder" 
        subtitle="Track and complete powerful item sets"
        icon={Sparkles}
        action={
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search sets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-slate-800/50 border-slate-700 w-48"
              />
            </div>
          </div>
        }
      />

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-xl p-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <Trophy className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{completedSets.length}</p>
              <p className="text-sm text-slate-400">Completed Sets</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-xl p-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-yellow-500/20 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-yellow-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{incompleteSets.length}</p>
              <p className="text-sm text-slate-400">In Progress</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-xl p-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-slate-700/50 flex items-center justify-center">
              <Filter className="w-6 h-6 text-slate-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{itemSets.length}</p>
              <p className="text-sm text-slate-400">Total Sets</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Rarity Filter */}
      <Tabs value={rarityFilter} onValueChange={setRarityFilter} className="mb-6">
        <TabsList className="bg-slate-800/50">
          <TabsTrigger value="all" className="data-[state=active]:bg-indigo-500">All</TabsTrigger>
          <TabsTrigger value="Rare" className="data-[state=active]:bg-blue-500">Rare</TabsTrigger>
          <TabsTrigger value="Epic" className="data-[state=active]:bg-purple-500">Epic</TabsTrigger>
          <TabsTrigger value="Legendary" className="data-[state=active]:bg-yellow-500">Legendary</TabsTrigger>
          <TabsTrigger value="Mythic" className="data-[state=active]:bg-red-500">Mythic</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Sets Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => (
            <Skeleton key={i} className="h-80 bg-slate-800" />
          ))}
        </div>
      ) : filteredSets.length > 0 ? (
        <div className="space-y-8">
          {/* Completed Sets */}
          {completedSets.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-emerald-400" />
                Completed Sets
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {completedSets.map((set, idx) => (
                  <motion.div
                    key={set.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <ItemSetCard
                      itemSet={set}
                      ownedPieces={getOwnedPieces(set.setKey)}
                      onClick={() => setSelectedSet(set)}
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* In Progress Sets */}
          {incompleteSets.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-400" />
                In Progress
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {incompleteSets.map((set, idx) => (
                  <motion.div
                    key={set.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <ItemSetCard
                      itemSet={set}
                      ownedPieces={getOwnedPieces(set.setKey)}
                      onClick={() => setSelectedSet(set)}
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Undiscovered Sets */}
          {undiscoveredSets.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Filter className="w-5 h-5 text-slate-400" />
                Undiscovered
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {undiscoveredSets.map((set, idx) => (
                  <motion.div
                    key={set.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <ItemSetCard
                      itemSet={set}
                      ownedPieces={[]}
                      onClick={() => setSelectedSet(set)}
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="glass rounded-xl p-12 text-center">
          <Sparkles className="w-16 h-16 mx-auto mb-4 text-slate-600" />
          <h3 className="text-xl font-semibold text-white mb-2">No Sets Found</h3>
          <p className="text-slate-400">Try adjusting your filters</p>
        </div>
      )}

      {/* Set Detail Sheet */}
      <Sheet open={!!selectedSet} onOpenChange={() => setSelectedSet(null)}>
        <SheetContent className="bg-slate-900 border-slate-800 w-full sm:max-w-lg overflow-y-auto">
          {selectedSet && (
            <SetDetailView 
              set={selectedSet} 
              ownedPieces={getOwnedPieces(selectedSet.setKey)}
            />
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function SetDetailView({ set, ownedPieces }) {
  const piecesEquipped = ownedPieces.length;
  const totalPieces = set.totalPieces || 3;

  return (
    <div className="pb-8">
      <SheetHeader className="mb-6">
        <SheetTitle className="text-white text-2xl">{set.name}</SheetTitle>
        <p className="text-slate-400">{set.description}</p>
      </SheetHeader>

      {/* Set Bonus Display */}
      <SetBonusDisplay
        equippedSet={set.name}
        piecesEquipped={piecesEquipped}
        totalPieces={totalPieces}
        bonuses={{
          twoPiece: set.twoPieceBonus,
          threePiece: set.threePieceBonus
        }}
      />

      {/* Crafting Requirements */}
      {set.craftingRequirements && (
        <div className="glass rounded-xl p-4 mt-4">
          <h4 className="text-sm font-semibold text-white mb-3">Crafting Requirements</h4>
          <div className="space-y-2 text-sm">
            {set.craftingRequirements.benchTier && (
              <div className="flex justify-between">
                <span className="text-slate-400">Bench Tier</span>
                <span className="text-white">{set.craftingRequirements.benchTier}+</span>
              </div>
            )}
            {set.craftingRequirements.trustRequired && (
              <div className="flex justify-between">
                <span className="text-slate-400">Wells Trust</span>
                <span className="text-white">{set.craftingRequirements.trustRequired}+</span>
              </div>
            )}
            {set.craftingRequirements.zoneLiberated && (
              <div className="flex justify-between">
                <span className="text-slate-400">Zone Required</span>
                <span className="text-white">{set.craftingRequirements.zoneLiberated}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}