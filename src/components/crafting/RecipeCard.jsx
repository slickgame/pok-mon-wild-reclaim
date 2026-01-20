import React from 'react';
import { motion } from 'framer-motion';
import { Lock, Clock, Sparkles, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const categoryColors = {
  'Potions': 'from-rose-500 to-pink-600',
  'Battle Items': 'from-red-500 to-orange-600',
  'Held Items': 'from-indigo-500 to-purple-600',
  'Bait': 'from-green-500 to-emerald-600',
  'Special': 'from-yellow-500 to-amber-600',
};

export default function RecipeCard({ recipe, canCraft = false, onCraft, onClick }) {
  const gradient = categoryColors[recipe.category] || 'from-slate-500 to-slate-600';
  
  return (
    <motion.div
      whileHover={{ scale: recipe.isUnlocked ? 1.02 : 1 }}
      onClick={recipe.isUnlocked ? onClick : undefined}
      className={`glass rounded-xl overflow-hidden ${recipe.isUnlocked ? 'cursor-pointer' : 'opacity-60'}`}
    >
      <div className={`h-2 bg-gradient-to-r ${gradient}`} />
      
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-white truncate">{recipe.name}</h3>
              {!recipe.isUnlocked && <Lock className="w-4 h-4 text-slate-500 flex-shrink-0" />}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Badge className="text-[10px] bg-slate-700/50 text-slate-300">
                {recipe.category}
              </Badge>
              <Badge className="text-[10px] bg-slate-700/50 text-slate-300">
                Tier {recipe.tier}
              </Badge>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-500" />
        </div>
        
        {recipe.requiredMaterials && recipe.requiredMaterials.length > 0 && (
          <div className="mb-3">
            <p className="text-[10px] text-slate-500 uppercase tracking-wide mb-1">Materials</p>
            <div className="flex flex-wrap gap-1">
              {recipe.requiredMaterials.map((mat, idx) => (
                <Badge key={idx} className="text-[10px] bg-slate-800 text-slate-300 border-slate-700">
                  {mat.itemName} x{mat.quantity}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {recipe.craftingTime}s
            </span>
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              +{recipe.craftingXpReward} XP
            </span>
          </div>
          
          {recipe.isUnlocked && (
            <Button
              size="sm"
              disabled={!canCraft}
              onClick={(e) => {
                e.stopPropagation();
                onCraft?.(recipe);
              }}
              className={`text-xs ${canCraft 
                ? 'bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600' 
                : 'bg-slate-700 text-slate-400'}`}
            >
              Craft
            </Button>
          )}
        </div>
        
        {!recipe.isUnlocked && recipe.unlockCondition && (
          <p className="text-[10px] text-slate-500 mt-3 italic">
            🔒 {recipe.unlockCondition}
          </p>
        )}
      </div>
    </motion.div>
  );
}