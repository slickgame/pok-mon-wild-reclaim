import React from 'react';
import { motion } from 'framer-motion';
import { Wrench, CheckCircle2, Lock, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const BENCH_TIERS = [
  {
    tier: 1,
    name: "Basic Workbench",
    description: "A simple wooden bench for basic healing items",
    benefits: [
      "Craft Tier I items",
      "Basic recipe access"
    ],
    requirement: "Starting tier"
  },
  {
    tier: 2,
    name: "Improved Forge",
    description: "Upgraded with metal tools and better materials",
    benefits: [
      "Craft Tier II items",
      "+5% critical craft chance",
      "Unlock Battle Items & Trinkets"
    ],
    questRequired: "Bottle the Energy",
    requirement: "Complete 'Bottle the Energy' quest"
  },
  {
    tier: 3,
    name: "Master's Workshop",
    description: "Wells' legendary crafting station",
    benefits: [
      "Craft Tier III items",
      "+10% material efficiency",
      "Unlock Reforging",
      "Batch crafting available"
    ],
    questRequired: "The Master's Mold",
    requirement: "Complete 'The Master's Mold' quest"
  }
];

export default function BenchUpgradePanel({ currentTier, completedQuests = [], onUpgradeQuest }) {
  return (
    <div className="glass rounded-xl p-5">
      <div className="flex items-center gap-3 mb-4">
        <Wrench className="w-5 h-5 text-amber-400" />
        <h3 className="font-semibold text-white">Wells' Bench Progress</h3>
        <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/50">
          Tier {currentTier}/3
        </Badge>
      </div>

      <div className="space-y-3">
        {BENCH_TIERS.map((bench) => {
          const isUnlocked = currentTier >= bench.tier;
          const canUnlock = bench.tier === currentTier + 1 && 
                           (!bench.questRequired || completedQuests.includes(bench.questRequired));
          
          return (
            <motion.div
              key={bench.tier}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: bench.tier * 0.1 }}
              className={`relative rounded-xl p-4 border-2 transition-all ${
                isUnlocked 
                  ? 'bg-amber-500/10 border-amber-500/30' 
                  : canUnlock
                  ? 'bg-indigo-500/10 border-indigo-500/30 cursor-pointer hover:bg-indigo-500/20'
                  : 'bg-slate-800/30 border-slate-700/50 opacity-60'
              }`}
              onClick={() => canUnlock && bench.questRequired && onUpgradeQuest?.(bench.questRequired)}
            >
              {isUnlocked && (
                <div className="absolute top-3 right-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                </div>
              )}
              
              {!isUnlocked && !canUnlock && (
                <div className="absolute top-3 right-3">
                  <Lock className="w-5 h-5 text-slate-500" />
                </div>
              )}

              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  isUnlocked ? 'bg-amber-500/20' : 'bg-slate-700/50'
                }`}>
                  <span className="text-lg font-bold text-white">{bench.tier}</span>
                </div>
                
                <div className="flex-1">
                  <h4 className="font-semibold text-white">{bench.name}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">{bench.description}</p>
                  
                  <div className="mt-2 space-y-1">
                    {bench.benefits.map((benefit, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 text-xs">
                        <Sparkles className="w-3 h-3 text-amber-400 flex-shrink-0" />
                        <span className={isUnlocked ? 'text-emerald-400' : 'text-slate-400'}>
                          {benefit}
                        </span>
                      </div>
                    ))}
                  </div>

                  {!isUnlocked && (
                    <p className="text-xs text-slate-500 mt-2 italic">
                      Requires: {bench.requirement}
                    </p>
                  )}

                  {canUnlock && bench.questRequired && (
                    <Button 
                      size="sm" 
                      className="mt-3 bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpgradeQuest?.(bench.questRequired);
                      }}
                    >
                      Start Quest
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}