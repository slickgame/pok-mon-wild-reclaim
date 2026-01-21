import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { FlaskConical, Sparkles, TrendingUp, RefreshCw, Heart, Book } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PageHeader from '@/components/common/PageHeader';
import PokemonCard from '@/components/pokemon/PokemonCard';
import TalentDisplay from '@/components/battle/TalentDisplay';
import TalentUpgradeModal from '@/components/talents/TalentUpgradeModal';
import TalentResetModal from '@/components/talents/TalentResetModal';
import { Skeleton } from '@/components/ui/skeleton';

export default function MaplesLabPage() {
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const [upgradeType, setUpgradeType] = useState(null);
  const [selectedTalent, setSelectedTalent] = useState(null);
  const [showResetModal, setShowResetModal] = useState(false);

  const { data: player } = useQuery({
    queryKey: ['player'],
    queryFn: async () => {
      const players = await base44.entities.Player.list();
      return players[0] || null;
    }
  });

  const { data: pokemon = [], isLoading } = useQuery({
    queryKey: ['playerPokemon'],
    queryFn: async () => {
      const pokemon = await base44.entities.Pokemon.filter({ isInTeam: true });
      return pokemon;
    }
  });

  const handleUpgradeConfirm = (talent, type) => {
    console.log('Upgrade confirmed:', talent, type);
    // TODO: Update Pokemon talent in database
    setUpgradeType(null);
    setSelectedTalent(null);
  };

  const handleResetConfirm = (preservedIndex) => {
    console.log('Reset confirmed, preserving talent:', preservedIndex);
    // TODO: Reset all talents except preserved one
    setShowResetModal(false);
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
          <TabsTrigger value="journal" className="data-[state=active]:bg-indigo-500">
            <Book className="w-4 h-4 mr-2" />
            Journal
          </TabsTrigger>
        </TabsList>

        {/* Upgrade Tab */}
        <TabsContent value="upgrade">
          <div className="space-y-6">
            <div className="glass rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Grade Upgrade Methods</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Bond Upgrade */}
                <div className="glass rounded-lg p-4 border border-pink-500/30">
                  <div className="flex items-center gap-2 mb-3">
                    <Heart className="w-5 h-5 text-pink-400" />
                    <h4 className="font-semibold text-white">Bond Upgrade</h4>
                  </div>
                  <p className="text-sm text-slate-400 mb-3">
                    Max friendship guarantees a +1 grade upgrade. One-time per Pokémon.
                  </p>
                  <Badge className="bg-pink-500/20 text-pink-300">
                    100% Success
                  </Badge>
                </div>

                {/* Training Scroll */}
                <div className="glass rounded-lg p-4 border border-yellow-500/30">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="w-5 h-5 text-yellow-400" />
                    <h4 className="font-semibold text-white">Training Scroll</h4>
                  </div>
                  <p className="text-sm text-slate-400 mb-3">
                    70% success, 25% no change, 5% downgrade. Uses craftable scrolls.
                  </p>
                  <Badge className="bg-yellow-500/20 text-yellow-300">
                    70% Success
                  </Badge>
                </div>

                {/* Talent Forge */}
                <div className="glass rounded-lg p-4 border border-orange-500/30">
                  <div className="flex items-center gap-2 mb-3">
                    <FlaskConical className="w-5 h-5 text-orange-400" />
                    <h4 className="font-semibold text-white">Talent Forge</h4>
                  </div>
                  <p className="text-sm text-slate-400 mb-3">
                    Uses 3-5 reagents. Quality affects success rate (up to 100%).
                  </p>
                  <Badge className="bg-orange-500/20 text-orange-300">
                    Variable Rate
                  </Badge>
                </div>
              </div>
            </div>

            {/* Pokemon Selection */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Select a Pokémon</h3>
              {isLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[1,2,3,4].map(i => (
                    <Skeleton key={i} className="h-48 bg-slate-800" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {pokemon.map((p) => (
                    <div key={p.id} onClick={() => setSelectedPokemon(p)}>
                      <PokemonCard pokemon={p} compact />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Selected Pokemon Details */}
            {selectedPokemon && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-xl p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">
                    {selectedPokemon.nickname || selectedPokemon.species}'s Talents
                  </h3>
                  <Button
                    variant="outline"
                    onClick={() => setShowResetModal(true)}
                    className="border-red-500/30 text-red-300 hover:bg-red-500/10"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Full Reset
                  </Button>
                </div>

                {selectedPokemon.talents?.length > 0 ? (
                  <div className="space-y-3">
                    {selectedPokemon.talents.map((talent, idx) => (
                      <div key={idx} className="glass rounded-lg p-4">
                        <TalentDisplay talents={[talent]} showDescription />
                        <div className="flex gap-2 mt-3">
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedTalent(talent);
                              setUpgradeType('grade');
                            }}
                            className="bg-yellow-600 hover:bg-yellow-700"
                          >
                            <TrendingUp className="w-3 h-3 mr-1" />
                            Upgrade Grade
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedTalent(talent);
                              setUpgradeType('reroll');
                            }}
                            className="border-purple-500/30 text-purple-300"
                          >
                            <RefreshCw className="w-3 h-3 mr-1" />
                            Re-Roll
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 text-center py-8">
                    This Pokémon has no talents yet.
                  </p>
                )}
              </motion.div>
            )}
          </div>
        </TabsContent>

        {/* Re-Roll Tab */}
        <TabsContent value="reroll">
          <div className="glass rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Talent Re-Rolling</h3>
            <p className="text-slate-400 mb-6">
              Use Talent Crystals to replace talents with new random ones. The grade will be randomized based on rarity.
            </p>
            <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
              <p className="text-sm text-purple-300">
                Select a Pokémon from the Upgrade tab to begin re-rolling talents.
              </p>
            </div>
          </div>
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
            
            {mapleTrust >= 60 ? (
              <div className="space-y-4">
                <p className="text-slate-300">
                  Combine rare reagents to perform high-quality talent upgrades. The quality of your reagents determines the success rate.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="glass rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-white mb-2">Standard Reagents</h4>
                    <p className="text-xs text-slate-400">70-80% success rate</p>
                  </div>
                  <div className="glass rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-white mb-2">Rare Catalyst</h4>
                    <p className="text-xs text-slate-400">Guaranteed A+ upgrade</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-slate-800/50 rounded-lg p-8 text-center">
                <p className="text-slate-400">
                  Build trust with Maple to level 60+ to unlock the Talent Forge
                </p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Journal Tab */}
        <TabsContent value="journal">
          <div className="glass rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Book className="w-5 h-5 text-indigo-400" />
              Talent Encyclopedia
            </h3>
            <p className="text-slate-400 mb-6">
              Browse all discovered talents, their effects, and synergy combinations.
            </p>
            <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-lg p-4">
              <p className="text-sm text-indigo-300">
                Talent journal feature coming soon! Track discovered talents and synergies here.
              </p>
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