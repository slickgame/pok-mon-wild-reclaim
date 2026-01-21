import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Trophy, Sparkles, Calendar, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import PageHeader from '@/components/common/PageHeader';
import ContestCard from '@/components/contests/ContestCard';
import ContestScorecard from '@/components/contests/ContestScorecard';
import PokemonCard from '@/components/pokemon/PokemonCard';
import TrinketSlot from '@/components/contests/TrinketSlot';
import { Badge } from '@/components/ui/badge';

export default function ContestsPage() {
  const [selectedContest, setSelectedContest] = useState(null);
  const [showEntrySheet, setShowEntrySheet] = useState(false);
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const [equippedTrinkets, setEquippedTrinkets] = useState([]);

  const { data: player } = useQuery({
    queryKey: ['player'],
    queryFn: async () => {
      const players = await base44.entities.Player.list();
      return players[0] || null;
    }
  });

  const { data: contests = [], isLoading } = useQuery({
    queryKey: ['contests'],
    queryFn: () => base44.entities.Contest.list()
  });

  const { data: pokemon = [] } = useQuery({
    queryKey: ['playerPokemon'],
    queryFn: async () => {
      const pokemon = await base44.entities.Pokemon.filter({ isInTeam: true });
      return pokemon;
    }
  });

  const { data: entries = [] } = useQuery({
    queryKey: ['contestEntries'],
    queryFn: () => base44.entities.ContestEntry.list()
  });

  const activeContests = contests.filter(c => c.isActive);

  const handleEnterContest = (contest) => {
    setSelectedContest(contest);
    setShowEntrySheet(true);
  };

  const handleSubmitEntry = () => {
    if (!selectedPokemon) return;
    console.log('Entering contest with:', selectedPokemon, equippedTrinkets);
    // TODO: Create ContestEntry
    setShowEntrySheet(false);
    setSelectedPokemon(null);
    setEquippedTrinkets([]);
  };

  const performerLevel = player?.performerLevel || 1;
  const performerXp = player?.performerXp || 0;
  const nextLevelXp = performerLevel * 100;

  return (
    <div>
      <PageHeader 
        title="Contest Hall" 
        subtitle="Showcase your Pokémon's talents and style"
        icon={Trophy}
      />

      {/* Performer Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-xl p-6 mb-6 border border-purple-500/30"
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <h3 className="text-lg font-semibold text-white">Performer Level {performerLevel}</h3>
            </div>
            <div className="w-64 h-2 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all"
                style={{ width: `${(performerXp / nextLevelXp) * 100}%` }}
              />
            </div>
            <p className="text-xs text-slate-400 mt-1">{performerXp}/{nextLevelXp} XP</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-white">{player?.contestWins || 0}</div>
            <p className="text-sm text-slate-400">Contest Wins</p>
          </div>
        </div>
      </motion.div>

      <Tabs defaultValue="active">
        <TabsList className="bg-slate-800/50 mb-6">
          <TabsTrigger value="active" className="data-[state=active]:bg-purple-500">
            <Calendar className="w-4 h-4 mr-2" />
            Active
          </TabsTrigger>
          <TabsTrigger value="leaderboard" className="data-[state=active]:bg-purple-500">
            <Award className="w-4 h-4 mr-2" />
            Leaderboard
          </TabsTrigger>
          <TabsTrigger value="history" className="data-[state=active]:bg-purple-500">
            <Trophy className="w-4 h-4 mr-2" />
            My History
          </TabsTrigger>
        </TabsList>

        {/* Active Contests */}
        <TabsContent value="active">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1,2,3].map(i => (
                <Skeleton key={i} className="h-80 bg-slate-800" />
              ))}
            </div>
          ) : activeContests.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeContests.map((contest, idx) => (
                <motion.div
                  key={contest.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <ContestCard
                    contest={contest}
                    onEnter={() => handleEnterContest(contest)}
                    hasEntered={entries.some(e => e.contestId === contest.id)}
                  />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="glass rounded-xl p-12 text-center">
              <Trophy className="w-16 h-16 mx-auto mb-4 text-slate-600" />
              <h3 className="text-xl font-semibold text-white mb-2">No Active Contests</h3>
              <p className="text-slate-400">Check back soon for new contests!</p>
            </div>
          )}
        </TabsContent>

        {/* Leaderboard */}
        <TabsContent value="leaderboard">
          <div className="glass rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Top Performers</h3>
            <p className="text-slate-400 text-center py-8">
              Leaderboard coming soon!
            </p>
          </div>
        </TabsContent>

        {/* History */}
        <TabsContent value="history">
          <div className="glass rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Contest History</h3>
            {entries.length > 0 ? (
              <div className="space-y-3">
                {entries.map((entry, idx) => (
                  <div key={idx} className="glass rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-white font-semibold">{entry.pokemonId}</p>
                        <p className="text-xs text-slate-400">Score: {entry.totalScore}</p>
                      </div>
                      <Badge className={`${
                        entry.rank === 1 ? 'bg-yellow-500/20 text-yellow-300' :
                        entry.rank === 2 ? 'bg-slate-400/20 text-slate-300' :
                        entry.rank === 3 ? 'bg-amber-700/20 text-amber-400' :
                        'bg-slate-700/50 text-slate-400'
                      }`}>
                        {entry.rank ? `#${entry.rank}` : 'Pending'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 text-center py-8">
                No contest entries yet. Enter your first contest to get started!
              </p>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Entry Sheet */}
      <Sheet open={showEntrySheet} onOpenChange={setShowEntrySheet}>
        <SheetContent className="bg-slate-900 border-slate-800 w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle className="text-white">Enter Contest</SheetTitle>
          </SheetHeader>

          {selectedContest && (
            <div className="space-y-6">
              {/* Pokemon Selection */}
              <div>
                <h4 className="text-sm font-semibold text-white mb-3">Select Pokémon</h4>
                <div className="grid grid-cols-2 gap-3">
                  {pokemon.map(p => (
                    <div 
                      key={p.id}
                      onClick={() => setSelectedPokemon(p)}
                      className={`cursor-pointer ${
                        selectedPokemon?.id === p.id ? 'ring-2 ring-purple-500 rounded-xl' : ''
                      }`}
                    >
                      <PokemonCard pokemon={p} compact />
                    </div>
                  ))}
                </div>
              </div>

              {/* Trinket Slots */}
              {selectedPokemon && (
                <div>
                  <h4 className="text-sm font-semibold text-white mb-3">Equip Trinkets (0-3)</h4>
                  <div className="grid grid-cols-3 gap-3">
                    {[1, 2, 3].map(slot => (
                      <TrinketSlot
                        key={slot}
                        trinket={equippedTrinkets[slot - 1]}
                        slotNumber={slot}
                        onEquip={() => console.log('Equip trinket')}
                        onUnequip={() => {
                          setEquippedTrinkets(prev => prev.filter((_, i) => i !== slot - 1));
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Submit */}
              <Button
                onClick={handleSubmitEntry}
                disabled={!selectedPokemon}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90"
              >
                Enter Contest ({selectedContest.entryFee}g)
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}