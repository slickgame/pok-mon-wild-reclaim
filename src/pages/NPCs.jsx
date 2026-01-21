import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Users, X, MessageCircle, Gift, ShoppingBag, Wrench, BookOpen, Heart, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PageHeader from '@/components/common/PageHeader';
import NPCCard from '@/components/npc/NPCCard';
import StatBar from '@/components/ui/StatBar';
import NPCScheduleCalendar from '@/components/time/NPCScheduleCalendar';

export default function NPCsPage() {
  const [selectedNPC, setSelectedNPC] = useState(null);

  const { data: player } = useQuery({
    queryKey: ['player'],
    queryFn: async () => {
      const players = await base44.entities.Player.list();
      return players[0] || null;
    }
  });

  const { data: npcs = [], isLoading } = useQuery({
    queryKey: ['npcs'],
    queryFn: () => base44.entities.NPC.list()
  });

  const { data: schedules = [] } = useQuery({
    queryKey: ['npcSchedules'],
    queryFn: () => base44.entities.NPCSchedule.list()
  });

  const { data: gameTime } = useQuery({
    queryKey: ['gameTime'],
    queryFn: async () => {
      const times = await base44.entities.GameTime.list();
      return times[0] || null;
    }
  });

  const getTrustLevel = (npcName) => {
    const key = npcName.toLowerCase().split(' ')[0].replace('.', '');
    return player?.trustLevels?.[key] || 0;
  };

  return (
    <div>
      <PageHeader 
        title="NPCs" 
        subtitle="Build relationships and unlock services"
        icon={Users}
      />

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4].map(i => (
            <Skeleton key={i} className="h-64 bg-slate-800" />
          ))}
        </div>
      ) : npcs.length > 0 ? (
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {npcs.map((npc, idx) => (
            <motion.div
              key={npc.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <NPCCard 
                npc={npc}
                trustLevel={getTrustLevel(npc.name)}
                onClick={() => setSelectedNPC(npc)}
              />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <div className="glass rounded-xl p-12 text-center">
          <Users className="w-16 h-16 mx-auto mb-4 text-slate-600" />
          <h3 className="text-xl font-semibold text-white mb-2">No NPCs Found</h3>
          <p className="text-slate-400">NPCs will appear as you explore the world</p>
        </div>
      )}

      {/* NPC Detail Sheet */}
      <Sheet open={!!selectedNPC} onOpenChange={() => setSelectedNPC(null)}>
        <SheetContent className="bg-slate-900 border-slate-800 w-full sm:max-w-lg overflow-y-auto">
          {selectedNPC && (
            <NPCDetailView 
              npc={selectedNPC} 
              trustLevel={getTrustLevel(selectedNPC.name)}
              schedule={schedules.find(s => s.npcName === selectedNPC.name)}
              gameTime={gameTime}
              onClose={() => setSelectedNPC(null)} 
            />
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function NPCDetailView({ npc, trustLevel, schedule, gameTime, onClose }) {
  const roleIcons = {
    'Crafting Mentor': Wrench,
    'Professor': BookOpen,
    'Nurse': Heart,
    'Merchant': ShoppingBag,
  };

  const roleColors = {
    'Crafting Mentor': 'from-amber-500 to-orange-600',
    'Professor': 'from-emerald-500 to-green-600',
    'Nurse': 'from-pink-500 to-rose-600',
    'Merchant': 'from-purple-500 to-violet-600',
  };

  const Icon = roleIcons[npc.role] || Users;
  const gradient = roleColors[npc.role] || 'from-indigo-500 to-purple-600';

  const getTrustTier = (trust) => {
    if (trust >= 80) return { label: 'Best Friend', color: 'text-yellow-400', emoji: '💛' };
    if (trust >= 50) return { label: 'Trusted', color: 'text-emerald-400', emoji: '💚' };
    if (trust >= 20) return { label: 'Friendly', color: 'text-blue-400', emoji: '💙' };
    return { label: 'Acquaintance', color: 'text-slate-400', emoji: '🤍' };
  };

  const trustTier = getTrustTier(trustLevel);

  const getDialogue = () => {
    if (trustLevel >= 80) return npc.dialogue?.highTrust || "You're my most trusted friend!";
    if (trustLevel >= 50) return npc.dialogue?.midTrust || "Good to see you again!";
    if (trustLevel >= 20) return npc.dialogue?.lowTrust || "Hello there, trainer.";
    return npc.dialogue?.greeting || "Welcome! I don't think we've met.";
  };

  return (
    <div className="pb-8">
      {/* Header */}
      <div className={`-mx-6 -mt-6 mb-6 h-36 bg-gradient-to-br ${gradient} relative`}>
        <div className="absolute inset-0 bg-black/30" />
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onClose}
          className="absolute top-4 right-4 text-white/70 hover:text-white hover:bg-white/20"
        >
          <X className="w-5 h-5" />
        </Button>
        
        {npc.avatarUrl ? (
          <img 
            src={npc.avatarUrl} 
            alt={npc.name} 
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-24 object-contain"
          />
        ) : (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-20 h-20 rounded-full bg-white/10 flex items-center justify-center">
            <Icon className="w-10 h-10 text-white/50" />
          </div>
        )}
      </div>

      {/* Name & Role */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white">{npc.name}</h2>
        <p className="text-slate-400">{npc.role}</p>
        {npc.location && (
          <p className="text-xs text-slate-500 mt-1">📍 {npc.location}</p>
        )}
      </div>

      {/* Trust Level */}
      <div className="glass rounded-xl p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-slate-400">Relationship</span>
          <span className={`text-sm font-medium ${trustTier.color}`}>
            {trustTier.emoji} {trustTier.label}
          </span>
        </div>
        <StatBar
          value={trustLevel}
          maxValue={npc.maxTrust || 100}
          color={`bg-gradient-to-r ${gradient}`}
        />
      </div>

      {/* Dialogue */}
      <div className="glass rounded-xl p-4 mb-4">
        <div className="flex items-start gap-3">
          <MessageCircle className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
          <p className="text-slate-300 text-sm italic">"{getDialogue()}"</p>
        </div>
      </div>

      {/* Description */}
      {npc.description && (
        <div className="glass rounded-xl p-4 mb-4">
          <h3 className="text-sm font-semibold text-white mb-2">About</h3>
          <p className="text-slate-300 text-sm">{npc.description}</p>
        </div>
      )}

      {/* Tabs for Services, Quests & Schedule */}
      <Tabs defaultValue="services" className="mt-6">
        <TabsList className="w-full bg-slate-800/50">
          <TabsTrigger value="services" className="flex-1 data-[state=active]:bg-indigo-500">
            Services
          </TabsTrigger>
          <TabsTrigger value="quests" className="flex-1 data-[state=active]:bg-indigo-500">
            Quests
          </TabsTrigger>
          <TabsTrigger value="schedule" className="flex-1 data-[state=active]:bg-indigo-500">
            Schedule
          </TabsTrigger>
        </TabsList>

        <TabsContent value="services" className="mt-4">
          {npc.servicesAvailable && npc.servicesAvailable.length > 0 ? (
            <div className="space-y-2">
              {npc.servicesAvailable.map((service, idx) => (
                <div 
                  key={idx} 
                  className="glass rounded-xl p-4 flex items-center justify-between cursor-pointer hover:bg-slate-800/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                      <Wrench className="w-5 h-5 text-indigo-400" />
                    </div>
                    <span className="text-white">{service}</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-500" />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400">
              <Wrench className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p>No services available yet</p>
              <p className="text-xs mt-1">Increase trust to unlock services</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="quests" className="mt-4">
          {npc.relationshipQuests && npc.relationshipQuests.length > 0 ? (
            <div className="space-y-2">
              {npc.relationshipQuests.map((quest, idx) => {
                const isAvailable = trustLevel >= quest.trustRequired;
                return (
                  <div 
                    key={idx} 
                    className={`glass rounded-xl p-4 ${isAvailable ? 'cursor-pointer hover:bg-slate-800/50' : 'opacity-60'} transition-colors`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-white font-medium">{quest.name}</h4>
                          {quest.isCompleted && (
                            <Badge className="bg-emerald-500/20 text-emerald-300 text-xs">Done</Badge>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-1">{quest.description}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <Badge className="text-xs bg-slate-700/50 text-slate-300">
                            Trust {quest.trustRequired}+ required
                          </Badge>
                          {quest.reward && (
                            <span className="text-xs text-amber-400 flex items-center gap-1">
                              <Gift className="w-3 h-3" /> {quest.reward}
                            </span>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-500 flex-shrink-0" />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400">
              <Gift className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p>No quests available</p>
              <p className="text-xs mt-1">Check back later for new adventures</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="schedule" className="mt-4">
          {schedule ? (
            <NPCScheduleCalendar 
              schedule={schedule}
              currentHour={gameTime?.currentHour}
              currentDay={gameTime?.currentDay}
            />
          ) : (
            <div className="text-center py-8 text-slate-400">
              <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p>Schedule not available</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Talk Button */}
      <Button className="w-full mt-6 bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600">
        <MessageCircle className="w-4 h-4 mr-2" /> Talk to {npc.name.split(' ')[0]}
      </Button>
    </div>
  );
}