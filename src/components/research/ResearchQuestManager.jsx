import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, CheckCircle } from 'lucide-react';
import ResearchQuestCard from './ResearchQuestCard';
import ResearchSubmitModal from './ResearchSubmitModal';

const VERDANT_SPECIES = [
  { name: 'Caterpie', rarity: 'common' },
  { name: 'Pidgey', rarity: 'common' },
  { name: 'Oddish', rarity: 'uncommon' },
  { name: 'Pikachu', rarity: 'rare' }
];

const NATURES = [
  "Hardy", "Lonely", "Brave", "Adamant", "Naughty",
  "Bold", "Docile", "Relaxed", "Impish", "Lax",
  "Timid", "Hasty", "Serious", "Jolly", "Naive",
  "Modest", "Mild", "Quiet", "Bashful", "Rash",
  "Calm", "Gentle", "Sassy", "Careful", "Quirky"
];

const REWARD_BASE = {
  common: 100,
  uncommon: 250,
  rare: 500
};

const IV_THRESHOLDS = {
  common: { min: 12, max: 18 },
  uncommon: { min: 15, max: 22 },
  rare: { min: 18, max: 25 }
};

const IV_STATS = ['hp', 'atk', 'def', 'spAtk', 'spDef', 'spd'];

function generateQuest() {
  const species = VERDANT_SPECIES[Math.floor(Math.random() * VERDANT_SPECIES.length)];
  const requirementType = Math.random() < 0.5 ? 'nature' : 'iv';
  
  const quest = {
    species: species.name,
    requirementType,
    rarity: species.rarity,
    rewardBase: REWARD_BASE[species.rarity],
    active: true
  };

  if (requirementType === 'nature') {
    quest.nature = NATURES[Math.floor(Math.random() * NATURES.length)];
  } else {
    quest.ivStat = IV_STATS[Math.floor(Math.random() * IV_STATS.length)];
    const thresholds = IV_THRESHOLDS[species.rarity];
    quest.ivThreshold = Math.floor(Math.random() * (thresholds.max - thresholds.min + 1)) + thresholds.min;
  }

  return quest;
}

export default function ResearchQuestManager() {
  const [selectedQuest, setSelectedQuest] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const queryClient = useQueryClient();

  const { data: quests = [], isLoading } = useQuery({
    queryKey: ['researchQuests'],
    queryFn: () => base44.entities.ResearchQuest.filter({ active: true })
  });

  const generateQuestsMutation = useMutation({
    mutationFn: async (count) => {
      const questsToCreate = [];
      for (let i = 0; i < count; i++) {
        questsToCreate.push(generateQuest());
      }
      await Promise.all(questsToCreate.map(q => base44.entities.ResearchQuest.create(q)));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['researchQuests'] });
    }
  });

  // Initialize quests if none exist
  useEffect(() => {
    if (!isLoading && quests.length < 3) {
      const neededQuests = 3 - quests.length;
      generateQuestsMutation.mutate(neededQuests);
    }
  }, [quests.length, isLoading]);

  const handleSuccess = (reward) => {
    setSelectedQuest(null);
    setSuccessMessage(`Thank you! Your Pokémon has greatly advanced our research. You received ${reward} gold!`);
    
    setTimeout(() => {
      setSuccessMessage(null);
      // Generate replacement quest
      generateQuestsMutation.mutate(1);
    }, 3000);
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <Sparkles className="w-12 h-12 mx-auto mb-4 text-indigo-400 animate-pulse" />
        <p className="text-slate-400">Loading research quests...</p>
      </div>
    );
  }

  return (
    <div>
      {successMessage && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="mb-6 bg-green-500/20 border border-green-500/50 rounded-lg p-4"
        >
          <div className="flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-green-400" />
            <p className="text-green-300 font-semibold">{successMessage}</p>
          </div>
        </motion.div>
      )}

      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-2">Active Research Requests</h3>
        <p className="text-sm text-slate-400">
          Submit Pokémon with specific natures or IVs to advance Professor Maple's research. 
          Submitted Pokémon are released and cannot be recovered.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {quests.map(quest => (
          <ResearchQuestCard
            key={quest.id}
            quest={quest}
            onSubmit={setSelectedQuest}
          />
        ))}
      </div>

      <AnimatePresence>
        {selectedQuest && (
          <ResearchSubmitModal
            quest={selectedQuest}
            onClose={() => setSelectedQuest(null)}
            onSuccess={handleSuccess}
          />
        )}
      </AnimatePresence>
    </div>
  );
}