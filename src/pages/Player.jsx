import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { User, Coins, HeartHandshake, ListChecks, CheckCircle2 } from 'lucide-react';
import PageHeader from '@/components/common/PageHeader';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

export default function PlayerPage() {
  const { data: player, isLoading } = useQuery({
    queryKey: ['player'],
    queryFn: async () => {
      const players = await base44.entities.Player.list();
      return players[0] || null;
    }
  });

  const { data: researchHistory = [] } = useQuery({
    queryKey: ['researchQuestHistory'],
    queryFn: () => base44.entities.ResearchQuest.filter({ active: false })
  });

  if (isLoading) {
    return (
      <div>
        <PageHeader title="Player" subtitle="Trainer profile and progress" icon={User} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-36 bg-slate-800" />)}
        </div>
      </div>
    );
  }

  const activeQuests = player?.activeQuests || [];
  const completedCrafting = player?.completedCraftingQuests || [];
  const completedResearch = researchHistory.filter((q) => q.status === 'completed');
  const trustEntries = Object.entries(player?.trustLevels || {});

  return (
    <div>
      <PageHeader title="Player" subtitle="Money, relationships, and quest progress" icon={User} />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <div className="glass rounded-xl p-4 border border-amber-500/30">
          <p className="text-xs uppercase text-slate-400">Money</p>
          <p className="text-2xl font-bold text-amber-300 flex items-center gap-2 mt-1">
            <Coins className="w-5 h-5" /> {player?.gold || 0}g
          </p>
        </div>

        <div className="glass rounded-xl p-4 border border-indigo-500/30">
          <p className="text-xs uppercase text-slate-400">Relationships</p>
          <p className="text-2xl font-bold text-indigo-300 flex items-center gap-2 mt-1">
            <HeartHandshake className="w-5 h-5" /> {trustEntries.length}
          </p>
        </div>

        <div className="glass rounded-xl p-4 border border-cyan-500/30">
          <p className="text-xs uppercase text-slate-400">Active Quests</p>
          <p className="text-2xl font-bold text-cyan-300 flex items-center gap-2 mt-1">
            <ListChecks className="w-5 h-5" /> {activeQuests.length}
          </p>
        </div>

        <div className="glass rounded-xl p-4 border border-emerald-500/30">
          <p className="text-xs uppercase text-slate-400">Completed Quests</p>
          <p className="text-2xl font-bold text-emerald-300 flex items-center gap-2 mt-1">
            <CheckCircle2 className="w-5 h-5" /> {completedCrafting.length + completedResearch.length}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="glass rounded-xl p-4 xl:col-span-1">
          <h3 className="text-white font-semibold mb-3">Relationships</h3>
          {trustEntries.length ? (
            <div className="space-y-2">
              {trustEntries.map(([name, trust]) => (
                <div key={name} className="flex items-center justify-between bg-slate-800/50 rounded-md px-3 py-2">
                  <span className="text-slate-200 capitalize">{name}</span>
                  <Badge className="bg-indigo-500/20 text-indigo-200">{trust}/100</Badge>
                </div>
              ))}
            </div>
          ) : <p className="text-sm text-slate-400">No relationships tracked yet.</p>}
        </div>

        <div className="glass rounded-xl p-4 xl:col-span-2">
          <h3 className="text-white font-semibold mb-3">Active Quests</h3>
          {activeQuests.length ? (
            <div className="space-y-2">
              {activeQuests.map((quest) => (
                <div key={quest.id || quest.questId} className="bg-slate-800/50 rounded-md px-3 py-2">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-slate-100 font-medium">{quest.name}</p>
                    <Badge className="bg-slate-700/70 text-slate-200">{quest.type || 'quest'}</Badge>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{quest.description}</p>
                  <p className="text-xs text-slate-300 mt-1">Progress: {quest.progress || 0}/{quest.goal || 1}</p>
                </div>
              ))}
            </div>
          ) : <p className="text-sm text-slate-400">No active quests.</p>}
        </div>
      </div>
    </div>
  );
}
