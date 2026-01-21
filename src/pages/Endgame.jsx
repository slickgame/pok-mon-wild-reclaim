import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Crown, Sparkles, Swords, Trophy } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import PageHeader from '@/components/common/PageHeader';
import LegendaryZoneCard from '@/components/endgame/LegendaryZoneCard';
import MythicQuestCard from '@/components/endgame/MythicQuestCard';
import TrainerRematchCard from '@/components/endgame/TrainerRematchCard';
import PrestigeCard from '@/components/endgame/PrestigeCard';

export default function EndgamePage() {
  const [selectedTab, setSelectedTab] = useState('legendary');

  const { data: player } = useQuery({
    queryKey: ['player'],
    queryFn: async () => {
      const players = await base44.entities.Player.list();
      return players[0] || null;
    }
  });

  const { data: legendaryZones = [], isLoading: loadingZones } = useQuery({
    queryKey: ['legendaryZones'],
    queryFn: () => base44.entities.LegendaryZone.list()
  });

  const { data: mythicQuests = [], isLoading: loadingQuests } = useQuery({
    queryKey: ['mythicQuests'],
    queryFn: () => base44.entities.MythicQuest.filter({ isActive: true })
  });

  const { data: trainers = [], isLoading: loadingTrainers } = useQuery({
    queryKey: ['trainerRematches'],
    queryFn: () => base44.entities.TrainerRematch.list()
  });

  const { data: prestiges = [], isLoading: loadingPrestiges } = useQuery({
    queryKey: ['prestiges'],
    queryFn: () => base44.entities.Prestige.list()
  });

  return (
    <div>
      <PageHeader 
        title="Endgame Content" 
        subtitle="Challenge legendary encounters and ascend to greatness"
        icon={Crown}
      />

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="bg-slate-800/50 mb-6">
          <TabsTrigger value="legendary" className="data-[state=active]:bg-purple-500">
            <Sparkles className="w-4 h-4 mr-2" />
            Legendary
          </TabsTrigger>
          <TabsTrigger value="mythic" className="data-[state=active]:bg-orange-500">
            <Crown className="w-4 h-4 mr-2" />
            Mythic Quests
          </TabsTrigger>
          <TabsTrigger value="rematches" className="data-[state=active]:bg-red-500">
            <Swords className="w-4 h-4 mr-2" />
            Rematches
          </TabsTrigger>
          <TabsTrigger value="prestige" className="data-[state=active]:bg-yellow-500">
            <Trophy className="w-4 h-4 mr-2" />
            Prestige
          </TabsTrigger>
        </TabsList>

        {/* Legendary Zones */}
        <TabsContent value="legendary">
          {loadingZones ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1,2,3].map(i => (
                <Skeleton key={i} className="h-96 bg-slate-800" />
              ))}
            </div>
          ) : legendaryZones.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {legendaryZones.map((zone, idx) => (
                <motion.div
                  key={zone.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <LegendaryZoneCard
                    zone={zone}
                    onClick={() => console.log('Open zone details')}
                  />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="glass rounded-xl p-12 text-center">
              <Sparkles className="w-16 h-16 mx-auto mb-4 text-slate-600" />
              <h3 className="text-xl font-semibold text-white mb-2">No Legendary Zones Yet</h3>
              <p className="text-slate-400">Complete quests to unlock legendary encounters</p>
            </div>
          )}
        </TabsContent>

        {/* Mythic Quests */}
        <TabsContent value="mythic">
          {loadingQuests ? (
            <div className="space-y-4">
              {[1,2,3].map(i => (
                <Skeleton key={i} className="h-48 bg-slate-800" />
              ))}
            </div>
          ) : mythicQuests.length > 0 ? (
            <div className="space-y-4">
              {mythicQuests.map((quest, idx) => (
                <motion.div
                  key={quest.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <MythicQuestCard
                    quest={quest}
                    onClick={() => console.log('Open quest details')}
                  />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="glass rounded-xl p-12 text-center">
              <Crown className="w-16 h-16 mx-auto mb-4 text-slate-600" />
              <h3 className="text-xl font-semibold text-white mb-2">No Active Mythic Quests</h3>
              <p className="text-slate-400">These will unlock as you progress</p>
            </div>
          )}
        </TabsContent>

        {/* Trainer Rematches */}
        <TabsContent value="rematches">
          {loadingTrainers ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1,2,3].map(i => (
                <Skeleton key={i} className="h-96 bg-slate-800" />
              ))}
            </div>
          ) : trainers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trainers.map((trainer, idx) => (
                <motion.div
                  key={trainer.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <TrainerRematchCard
                    trainer={trainer}
                    onChallenge={() => console.log('Start rematch')}
                  />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="glass rounded-xl p-12 text-center">
              <Swords className="w-16 h-16 mx-auto mb-4 text-slate-600" />
              <h3 className="text-xl font-semibold text-white mb-2">No Rematches Available</h3>
              <p className="text-slate-400">Defeat trainers to unlock rematches</p>
            </div>
          )}
        </TabsContent>

        {/* Prestige */}
        <TabsContent value="prestige">
          {loadingPrestiges ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1,2,3,4].map(i => (
                <Skeleton key={i} className="h-64 bg-slate-800" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {['Crafter', 'Angler', 'Performer', 'Explorer'].map((type, idx) => {
                const prestige = prestiges.find(p => p.professionType === type) || {
                  professionType: type,
                  prestigeLevel: 0,
                  bonuses: []
                };
                const currentLevel = type === 'Crafter' ? player?.craftingLevel || 1 :
                                   type === 'Angler' ? player?.anglerLevel || 1 :
                                   type === 'Performer' ? player?.performerLevel || 1 :
                                   player?.professionLevel || 1;
                return (
                  <motion.div
                    key={type}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <PrestigeCard
                      prestige={prestige}
                      currentLevel={currentLevel}
                      maxLevel={10}
                      onPrestige={() => console.log('Prestige', type)}
                    />
                  </motion.div>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}