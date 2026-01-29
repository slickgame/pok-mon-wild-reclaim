import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { FlaskConical, Sparkles, TrendingUp, RefreshCw, Heart, Lock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PageHeader from '@/components/common/PageHeader';
import TalentUpgradeModal from '@/components/talents/TalentUpgradeModal';
import TalentResetModal from '@/components/talents/TalentResetModal';
import TalentUpgradeTab from '@/components/talents/TalentUpgradeTab';
import TalentRerollTab from '@/components/talents/TalentRerollTab';
import { toast } from '@/components/ui/use-toast';
import { upgradeTalent } from '@/systems/talentUpgrade';
import { formatUpgradeResult } from '@/utils/formatTalentResult';
import { reRollTalents } from '@/systems/talentReroll';

export default function MaplesLabPage() {
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const [selectedRerollPokemon, setSelectedRerollPokemon] = useState(null);
  const [upgradeType, setUpgradeType] = useState(null);
  const [selectedTalent, setSelectedTalent] = useState(null);
  const [selectedTalentIndex, setSelectedTalentIndex] = useState(null);
  const [showResetModal, setShowResetModal] = useState(false);

  const { data: player } = useQuery({
    queryKey: ['player'],
    queryFn: async () => {
      const players = await base44.entities.Player.list();
      return players[0] || null;
    }
  });

  const { data: pokemon = [], isLoading, refetch: refetchPokemon } = useQuery({
    queryKey: ['playerPokemon'],
    queryFn: async () => {
      const pokemon = await base44.entities.Pokemon.filter({ isInTeam: true });
      return pokemon;
    }
  });

  const { data: inventory = [], refetch: refetchInventory } = useQuery({
    queryKey: ['inventory'],
    queryFn: async () => {
      const items = await base44.entities.Item.list();
      return items;
    }
  });

  const handleUpgradeConfirm = async () => {
    if (!selectedPokemon || selectedTalentIndex === null) {
      return { success: false, reason: 'No talent selected.' };
    }

    const updatedPokemon = {
      ...selectedPokemon,
      talents: selectedPokemon.talents?.map((talent) => ({ ...talent })) || [],
    };

    const result = upgradeTalent(updatedPokemon, selectedTalentIndex, upgradeType);

    if (result.success) {
      await base44.entities.Pokemon.update(selectedPokemon.id, {
        talents: updatedPokemon.talents,
        usedBondUpgrade: updatedPokemon.usedBondUpgrade || false,
      });
      setSelectedPokemon(updatedPokemon);
      refetchPokemon();
    }

    const isDowngrade = result.result === 'downgrade';
    toast({
      title: 'Talent Upgrade',
      description: formatUpgradeResult(result),
      variant: result.success && !isDowngrade ? 'default' : 'destructive',
    });

    setUpgradeType(null);
    setSelectedTalent(null);
    setSelectedTalentIndex(null);

    return {
      ...result,
      success: result.success && !isDowngrade,
      message: formatUpgradeResult(result),
      downgrade: isDowngrade,
    };
  };

  const handleResetConfirm = (preservedIndex) => {
    console.log('Reset confirmed, preserving talent:', preservedIndex);
    // TODO: Reset all talents except preserved one
    setShowResetModal(false);
  };

  const handleRerollConfirm = async (pokemonTarget) => {
    if (!pokemonTarget) return;

    const updatedPokemon = {
      ...pokemonTarget,
      talents: pokemonTarget.talents?.map((talent) => ({ ...talent })) || [],
    };

    const result = reRollTalents(updatedPokemon, inventory);

    if (!result.success) {
      toast({
        title: 'Talent Re-Roll',
        description: result.reason,
        variant: 'destructive',
      });
      return;
    }

    await base44.entities.Pokemon.update(updatedPokemon.id, {
      talents: result.talents,
    });

    if (result.consumedItem?.id) {
      await base44.entities.Item.update(result.consumedItem.id, {
        quantity: result.consumedItem.quantity,
      });
    }

    setSelectedRerollPokemon(updatedPokemon);
    refetchPokemon();
    refetchInventory();

    toast({
      title: 'Talent Re-Roll',
      description: `🎲 Assigned ${result.talents.length} new talent(s)!`,
    });
  };

  const mapleTrust = player?.trustLevels?.maple || 0;

  return (
    <div>
      <PageHeader 
        title="Maple's Talent Lab" 
        subtitle="Upgrade and optimize your Pokémon's talents"
        icon={FlaskConical}
      />

      {/* Maple's Welcome Message */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-xl p-6 mb-6 border border-emerald-500/30"
      >
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-2xl">
            🔬
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white mb-2">Welcome to My Lab!</h3>
            <p className="text-slate-300 mb-3">
              {mapleTrust >= 50 
                ? "Our bond has unlocked advanced talent manipulation! Let's push your Pokémon to their limits."
                : "I can help you optimize your Pokémon's talents through various upgrade methods. Build trust with me to unlock more advanced techniques!"}
            </p>
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-emerald-400" />
              <span className="text-sm text-slate-400">
                Trust Level: {mapleTrust}/100
              </span>
              {mapleTrust >= 100 && (
                <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/50 ml-2">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Max Trust Bonus Active
                </Badge>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      <Tabs defaultValue="upgrade" className="space-y-6">
        <TabsList className="bg-slate-800/50">
          <TabsTrigger value="upgrade" className="data-[state=active]:bg-indigo-500">
            <TrendingUp className="w-4 h-4 mr-2" />
            Upgrade
          </TabsTrigger>
          <TabsTrigger value="reroll" className="data-[state=active]:bg-indigo-500">
            <RefreshCw className="w-4 h-4 mr-2" />
            Re-Roll
          </TabsTrigger>
          <TabsTrigger value="forge" className="data-[state=active]:bg-indigo-500">
            <FlaskConical className="w-4 h-4 mr-2" />
            Talent Forge
          </TabsTrigger>
        </TabsList>

        {/* Upgrade Tab */}
        <TabsContent value="upgrade">
          <TalentUpgradeTab
            pokemon={pokemon}
            isLoading={isLoading}
            selectedPokemon={selectedPokemon}
            onSelectPokemon={setSelectedPokemon}
            onFullReset={() => setShowResetModal(true)}
            onUpgradeTalent={(pokemonTarget, talentIndex, method) => {
              setSelectedTalent(pokemonTarget.talents?.[talentIndex]);
              setSelectedTalentIndex(talentIndex);
              setUpgradeType(method);
            }}
          />
        </TabsContent>

        {/* Re-Roll Tab */}
        <TabsContent value="reroll">
          <TalentRerollTab
            pokemon={pokemon}
            isLoading={isLoading}
            selectedPokemon={selectedRerollPokemon}
            onSelectPokemon={setSelectedRerollPokemon}
            onRequestReroll={handleRerollConfirm}
          />
        </TabsContent>

        {/* Talent Forge Tab */}
        <TabsContent value="forge">
          <div className="glass rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                <FlaskConical className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Talent Forge</h3>
                <p className="text-xs text-slate-400">Unlocked after Act 2</p>
              </div>
            </div>
            
            <div className="bg-slate-800/50 rounded-lg p-8 text-center">
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-slate-700/60 flex items-center justify-center">
                  <Lock className="w-5 h-5 text-slate-300" />
                </div>
                <p className="text-slate-400">
                  🔒 Unlocks after Act 2 and Trust Level 60+
                </p>
                <p className="text-xs text-slate-500">
                  Current Trust: {mapleTrust}/100
                </p>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      {upgradeType && selectedTalent && (
        <TalentUpgradeModal
          open={!!upgradeType}
          onClose={() => {
            setUpgradeType(null);
            setSelectedTalent(null);
          }}
          talent={selectedTalent}
          upgradeType={upgradeType}
          onConfirm={handleUpgradeConfirm}
        />
      )}

      {showResetModal && selectedPokemon && (
        <TalentResetModal
          open={showResetModal}
          onClose={() => setShowResetModal(false)}
          talents={selectedPokemon.talents || []}
          onConfirm={handleResetConfirm}
          hasPreservationToken={false}
        />
      )}
    </div>
  );
}
