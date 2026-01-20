import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { FlaskConical, Search, Sparkles, Clock, X, ChevronRight, Lock, Beaker, Swords, Target, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Progress } from '@/components/ui/progress';
import PageHeader from '@/components/common/PageHeader';
import RecipeCard from '@/components/crafting/RecipeCard';
import StatBar from '@/components/ui/StatBar';

const categories = [
  { value: 'all', label: 'All' },
  { value: 'Potions', label: 'Potions' },
  { value: 'Battle Items', label: 'Battle' },
  { value: 'Held Items', label: 'Held' },
  { value: 'Bait', label: 'Bait' },
  { value: 'Special', label: 'Special' },
];

export default function CraftingPage() {
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCrafting, setIsCrafting] = useState(false);
  const [craftingProgress, setCraftingProgress] = useState(0);

  const { data: player } = useQuery({
    queryKey: ['player'],
    queryFn: async () => {
      const players = await base44.entities.Player.list();
      return players[0] || null;
    }
  });

  const { data: recipes = [], isLoading } = useQuery({
    queryKey: ['recipes'],
    queryFn: () => base44.entities.CraftingRecipe.list()
  });

  const { data: inventory = [] } = useQuery({
    queryKey: ['inventory'],
    queryFn: () => base44.entities.Item.list()
  });

  const filteredRecipes = recipes.filter(recipe => {
    const matchesCategory = filter === 'all' || recipe.category === filter;
    const matchesSearch = recipe.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const unlockedRecipes = filteredRecipes.filter(r => r.isUnlocked);
  const lockedRecipes = filteredRecipes.filter(r => !r.isUnlocked);

  const checkCanCraft = (recipe) => {
    if (!recipe.requiredMaterials) return true;
    return recipe.requiredMaterials.every(mat => {
      const invItem = inventory.find(i => i.name === mat.itemName);
      return invItem && (invItem.quantity || 1) >= mat.quantity;
    });
  };

  const handleCraft = async (recipe) => {
    setIsCrafting(true);
    setCraftingProgress(0);
    
    const interval = setInterval(() => {
      setCraftingProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsCrafting(false);
          return 100;
        }
        return prev + (100 / recipe.craftingTime);
      });
    }, 1000);
  };

  const craftingXpToNextLevel = 100 * (player?.craftingLevel || 1);

  return (
    <div>
      <PageHeader 
        title="Crafting Bench" 
        subtitle="Wells' Workshop"
        icon={FlaskConical}
        action={
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search recipes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-slate-800/50 border-slate-700 w-48"
            />
          </div>
        }
      />

      {/* Crafting Level */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-xl p-5 mb-6"
      >
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center">
              <FlaskConical className="w-7 h-7 text-amber-400" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Crafting Level</p>
              <p className="text-2xl font-bold text-white">{player?.craftingLevel || 1}</p>
            </div>
          </div>
          
          <div className="flex-1">
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>Experience</span>
              <span>{player?.craftingXp || 0} / {craftingXpToNextLevel} XP</span>
            </div>
            <StatBar
              value={player?.craftingXp || 0}
              maxValue={craftingXpToNextLevel}
              color="bg-gradient-to-r from-amber-500 to-orange-500"
              showValue={false}
            />
          </div>
          
          <div className="text-right">
            <p className="text-slate-400 text-sm">Recipes Unlocked</p>
            <p className="text-xl font-bold text-white">{unlockedRecipes.length}/{recipes.length}</p>
          </div>
        </div>
      </motion.div>

      {/* Category Tabs */}
      <div className="mb-6 overflow-x-auto pb-2">
        <Tabs value={filter} onValueChange={setFilter}>
          <TabsList className="bg-slate-800/50 p-1">
            {categories.map((cat) => (
              <TabsTrigger 
                key={cat.value} 
                value={cat.value}
                className="data-[state=active]:bg-indigo-500"
              >
                {cat.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => (
            <Skeleton key={i} className="h-48 bg-slate-800" />
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Unlocked Recipes */}
          {unlockedRecipes.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-slate-400 mb-3 flex items-center gap-2">
                Available Recipes
                <Badge className="bg-emerald-500/20 text-emerald-300">{unlockedRecipes.length}</Badge>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {unlockedRecipes.map((recipe, idx) => (
                  <motion.div
                    key={recipe.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <RecipeCard
                      recipe={recipe}
                      canCraft={checkCanCraft(recipe)}
                      onCraft={handleCraft}
                      onClick={() => setSelectedRecipe(recipe)}
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Locked Recipes */}
          {lockedRecipes.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-slate-400 mb-3 flex items-center gap-2">
                <Lock className="w-4 h-4" /> Locked Recipes
                <Badge className="bg-slate-700/50 text-slate-400">{lockedRecipes.length}</Badge>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {lockedRecipes.map((recipe, idx) => (
                  <motion.div
                    key={recipe.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <RecipeCard recipe={recipe} />
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {filteredRecipes.length === 0 && (
            <div className="glass rounded-xl p-12 text-center">
              <FlaskConical className="w-16 h-16 mx-auto mb-4 text-slate-600" />
              <h3 className="text-xl font-semibold text-white mb-2">No Recipes Found</h3>
              <p className="text-slate-400">Try a different search or category</p>
            </div>
          )}
        </div>
      )}

      {/* Crafting Progress Modal */}
      <AnimatePresence>
        {isCrafting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass rounded-2xl p-8 max-w-sm w-full mx-4 text-center"
            >
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center">
                <FlaskConical className="w-10 h-10 text-amber-400 animate-pulse" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Crafting...</h3>
              <Progress value={craftingProgress} className="h-2 mb-2" />
              <p className="text-slate-400 text-sm">{Math.round(craftingProgress)}%</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recipe Detail Sheet */}
      <Sheet open={!!selectedRecipe && !isCrafting} onOpenChange={() => setSelectedRecipe(null)}>
        <SheetContent className="bg-slate-900 border-slate-800 w-full sm:max-w-md overflow-y-auto">
          {selectedRecipe && (
            <RecipeDetailView 
              recipe={selectedRecipe} 
              inventory={inventory}
              canCraft={checkCanCraft(selectedRecipe)}
              onCraft={handleCraft}
              onClose={() => setSelectedRecipe(null)} 
            />
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function RecipeDetailView({ recipe, inventory, canCraft, onCraft, onClose }) {
  const categoryColors = {
    'Potions': 'from-rose-500 to-pink-600',
    'Battle Items': 'from-red-500 to-orange-600',
    'Held Items': 'from-indigo-500 to-purple-600',
    'Bait': 'from-green-500 to-emerald-600',
    'Special': 'from-yellow-500 to-amber-600',
  };

  const gradient = categoryColors[recipe.category] || 'from-slate-500 to-slate-600';

  const getMaterialCount = (materialName) => {
    const item = inventory.find(i => i.name === materialName);
    return item ? (item.quantity || 1) : 0;
  };

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

      {/* Header */}
      <div className={`h-3 bg-gradient-to-r ${gradient} -mx-6 mb-6`} />

      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-white mb-2">{recipe.name}</h2>
        <div className="flex justify-center gap-2">
          <Badge className="bg-slate-700/50 text-slate-300">{recipe.category}</Badge>
          <Badge className="bg-slate-700/50 text-slate-300">Tier {recipe.tier}</Badge>
        </div>
      </div>

      {/* Output */}
      <div className="glass rounded-xl p-4 mb-4">
        <h3 className="text-sm font-semibold text-white mb-3">Creates</h3>
        <div className="flex items-center gap-3 bg-slate-800/50 rounded-lg p-3">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 flex items-center justify-center">
            <Package className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <p className="text-white font-medium">{recipe.outputItem}</p>
            <p className="text-xs text-slate-400">x{recipe.outputQuantity || 1}</p>
          </div>
        </div>
      </div>

      {/* Materials */}
      {recipe.requiredMaterials && recipe.requiredMaterials.length > 0 && (
        <div className="glass rounded-xl p-4 mb-4">
          <h3 className="text-sm font-semibold text-white mb-3">Required Materials</h3>
          <div className="space-y-2">
            {recipe.requiredMaterials.map((mat, idx) => {
              const have = getMaterialCount(mat.itemName);
              const enough = have >= mat.quantity;
              return (
                <div key={idx} className="flex items-center justify-between bg-slate-800/50 rounded-lg p-3">
                  <span className="text-white">{mat.itemName}</span>
                  <span className={enough ? 'text-emerald-400' : 'text-rose-400'}>
                    {have}/{mat.quantity}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="glass rounded-xl p-4 text-center">
          <Clock className="w-5 h-5 text-slate-400 mx-auto mb-1" />
          <p className="text-white font-semibold">{recipe.craftingTime}s</p>
          <p className="text-xs text-slate-400">Craft Time</p>
        </div>
        <div className="glass rounded-xl p-4 text-center">
          <Sparkles className="w-5 h-5 text-amber-400 mx-auto mb-1" />
          <p className="text-white font-semibold">+{recipe.craftingXpReward}</p>
          <p className="text-xs text-slate-400">XP Reward</p>
        </div>
      </div>

      {/* Craft Button */}
      <Button
        className={`w-full ${canCraft 
          ? 'bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600' 
          : 'bg-slate-700 text-slate-400'}`}
        disabled={!canCraft}
        onClick={() => onCraft(recipe)}
      >
        <FlaskConical className="w-4 h-4 mr-2" />
        {canCraft ? 'Start Crafting' : 'Missing Materials'}
      </Button>
    </div>
  );
}