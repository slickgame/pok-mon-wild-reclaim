import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { Home, MapPin, PawPrint, Sparkles, ChevronRight, Zap, Target, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import PageHeader from '@/components/common/PageHeader';
import BulletinBoard from '@/components/time/BulletinBoard';
import PokemonCard from '@/components/pokemon/PokemonCard';
import QuestCard from '@/components/home/QuestCard';
import TrustMeter from '@/components/home/TrustMeter';
import StatBar from '@/components/ui/StatBar';
import TutorialOverlay from '../components/tutorial/TutorialOverlay';

export default function HomePage() {
  const [currentTutorial, setCurrentTutorial] = useState(null);
  
  const { data: player, isLoading: playerLoading } = useQuery({
    queryKey: ['player'],
    queryFn: async () => {
      const players = await base44.entities.Player.list();
      return players[0] || null;
    },
    staleTime: 30000,
    refetchOnWindowFocus: false
  });

  const { data: team = [], isLoading: teamLoading } = useQuery({
    queryKey: ['team'],
    queryFn: async () => {
      return await base44.entities.Pokemon.filter({ isInTeam: true });
    },
    staleTime: 20000,
    refetchOnWindowFocus: false
  });

  const { data: tutorials = [] } = useQuery({
    queryKey: ['tutorials'],
    queryFn: () => base44.entities.Tutorial.list(),
    staleTime: 60000,
    refetchOnWindowFocus: false
  });

  // Check for onboarding
  useEffect(() => {
    if (!playerLoading && !player) {
      window.location.href = createPageUrl('StartScreen');
    }
  }, [player, playerLoading]);

  // Show tutorial if available (prioritized) - only trigger once
  useEffect(() => {
    if (!player?.hasSeenIntro) return;
    
    const pendingTutorials = tutorials
      .filter(t => !t.isCompleted && !t.isSkipped && t.trigger === 'onboarding')
      .sort((a, b) => (a.priority || 0) - (b.priority || 0));
    
    if (pendingTutorials.length > 0 && !currentTutorial) {
      setCurrentTutorial(pendingTutorials[0]);
    }
  }, [tutorials, currentTutorial, player]);

  const handleCompleteTutorial = async () => {
    if (!currentTutorial) return;
    
    await base44.entities.Tutorial.update(currentTutorial.id, {
      isCompleted: true,
      completedAt: new Date().toISOString()
    });
    
    // Fully clear and invalidate
    setCurrentTutorial(null);
    
    // Invalidate to prevent re-trigger
    const queryClient = await import('@tanstack/react-query').then(m => m.useQueryClient);
    queryClient().invalidateQueries({ queryKey: ['tutorials'] });
  };

  const handleSkipTutorials = async () => {
    for (const tutorial of tutorials) {
      if (!tutorial.isCompleted) {
        await base44.entities.Tutorial.update(tutorial.id, {
          isSkipped: true
        });
      }
    }
    
    setCurrentTutorial(null);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  if (playerLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-20 w-full bg-slate-800" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-64 bg-slate-800 lg:col-span-2" />
          <Skeleton className="h-64 bg-slate-800" />
        </div>
      </div>
    );
  }

  return (
    <>
      <TutorialOverlay
        tutorial={currentTutorial}
        onComplete={handleCompleteTutorial}
        onSkip={handleSkipTutorials}
      />
      
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-6"
      >
      {/* Welcome Banner */}
      <motion.div 
        variants={itemVariants}
        className="glass rounded-2xl p-6 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
              Welcome back, <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">{player?.name || 'Trainer'}</span>!
            </h1>
            <div className="flex items-center gap-4 text-sm text-slate-400">
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4 text-indigo-400" />
                {player?.currentLocation || 'Unknown Location'}
              </span>
              <span className="flex items-center gap-1">
                <PawPrint className="w-4 h-4 text-cyan-400" />
                {team.length} Pokémon
              </span>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Link to={createPageUrl('Zones')}>
              <Button className="bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600">
                <MapPin className="w-4 h-4 mr-2" />
                Explore
              </Button>
            </Link>
            <Link to={createPageUrl('Pokemon')}>
              <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800">
                <PawPrint className="w-4 h-4 mr-2" />
                Team
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{player?.craftingLevel || 1}</p>
              <p className="text-xs text-slate-400">Crafting Lv.</p>
            </div>
          </div>
        </div>
        
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{player?.professionLevel || 1}</p>
              <p className="text-xs text-slate-400">Profession Lv.</p>
            </div>
          </div>
        </div>
        
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <Target className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{player?.activeQuests?.length || 0}</p>
              <p className="text-xs text-slate-400">Active Quests</p>
            </div>
          </div>
        </div>
        
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <Zap className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{player?.discoveredZones?.length || 1}</p>
              <p className="text-xs text-slate-400">Zones Found</p>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Team Preview */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <div className="glass rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white flex items-center gap-2">
                <PawPrint className="w-5 h-5 text-indigo-400" />
                Your Team
              </h3>
              <Link to={createPageUrl('Pokemon')} className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                View All <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            
            {teamLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[1,2,3].map(i => <Skeleton key={i} className="h-48 bg-slate-800" />)}
              </div>
            ) : team.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {team.slice(0, 3).map((pokemon) => (
                  <PokemonCard key={pokemon.id} pokemon={pokemon} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400">
                <PawPrint className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No Pokémon in your team yet</p>
                <p className="text-sm mt-1">Start exploring to catch some!</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Trust Levels */}
        <motion.div variants={itemVariants}>
          <TrustMeter trustLevels={player?.trustLevels || {}} />
        </motion.div>
      </div>

      {/* Active Quests */}
      <motion.div variants={itemVariants} className="glass rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-white flex items-center gap-2">
            <Target className="w-5 h-5 text-amber-400" />
            Active Quests
          </h3>
        </div>
        
        {player?.activeQuests && player.activeQuests.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {player.activeQuests.slice(0, 4).map((quest) => (
              <QuestCard key={quest.id} quest={quest} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-400">
            <Target className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p>No active quests</p>
            <p className="text-sm mt-1">Talk to NPCs to get started!</p>
          </div>
        )}
      </motion.div>
      </motion.div>
    </>
  );
}