import React from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Swords, Trophy, FlaskConical, Fish, Sparkles, Crown, Users } from 'lucide-react';
import PageHeader from '@/components/common/PageHeader';

// Import existing page components
import BattlePage from './Battle';
import ContestsPage from './Contests';
import CraftingPage from './Crafting';
import FishingPage from './Fishing';
import MaplesLabPage from './MaplesLab';
import EndgamePage from './Endgame';
import NPCsPage from './NPCs';

export default function TownPage() {
  return (
    <div>
      <PageHeader
        title="Town Center"
        subtitle="Access all town facilities and activities"
        icon={Sparkles}
      />

      <Tabs defaultValue="npcs" className="w-full">
        <TabsList className="glass grid grid-cols-4 lg:grid-cols-7 gap-2 p-2 mb-6">
          <TabsTrigger value="npcs" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">NPCs</span>
          </TabsTrigger>
          <TabsTrigger value="battle" className="flex items-center gap-2">
            <Swords className="w-4 h-4" />
            <span className="hidden sm:inline">Battle Arena</span>
          </TabsTrigger>
          <TabsTrigger value="contests" className="flex items-center gap-2">
            <Trophy className="w-4 h-4" />
            <span className="hidden sm:inline">Contests</span>
          </TabsTrigger>
          <TabsTrigger value="crafting" className="flex items-center gap-2">
            <FlaskConical className="w-4 h-4" />
            <span className="hidden sm:inline">Crafting</span>
          </TabsTrigger>
          <TabsTrigger value="fishing" className="flex items-center gap-2">
            <Fish className="w-4 h-4" />
            <span className="hidden sm:inline">Fishing</span>
          </TabsTrigger>
          <TabsTrigger value="lab" className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            <span className="hidden sm:inline">Maple's Lab</span>
          </TabsTrigger>
          <TabsTrigger value="endgame" className="flex items-center gap-2">
            <Crown className="w-4 h-4" />
            <span className="hidden sm:inline">Endgame</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="npcs">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-xl p-6 border border-indigo-500/20"
          >
            <div className="mb-4">
              <h3 className="text-xl font-bold text-white mb-2">👥 Town NPCs</h3>
              <p className="text-slate-400 text-sm">
                Meet the town residents. Visit Meera's shop, research with Professor Maple, or learn new moves!
              </p>
            </div>
            <NPCsPage />
          </motion.div>
        </TabsContent>

        <TabsContent value="battle">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-xl p-6 border border-indigo-500/20"
          >
            <div className="mb-4">
              <h3 className="text-xl font-bold text-white mb-2">⚔️ Battle Arena</h3>
              <p className="text-slate-400 text-sm">
                Test your skills in organized battles. Train with wild Pokémon or practice with your team.
              </p>
            </div>
            <BattlePage />
          </motion.div>
        </TabsContent>

        <TabsContent value="contests">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-xl p-6 border border-indigo-500/20"
          >
            <div className="mb-4">
              <h3 className="text-xl font-bold text-white mb-2">🏆 Contest Hall</h3>
              <p className="text-slate-400 text-sm">
                Showcase your Pokémon's beauty and talent. Compete for ribbons and rewards!
              </p>
            </div>
            <ContestsPage />
          </motion.div>
        </TabsContent>

        <TabsContent value="crafting">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-xl p-6 border border-indigo-500/20"
          >
            <div className="mb-4">
              <h3 className="text-xl font-bold text-white mb-2">🔨 Crafting Station</h3>
              <p className="text-slate-400 text-sm">
                Forge powerful items, potions, and equipment. Wells' workshop awaits.
              </p>
            </div>
            <CraftingPage />
          </motion.div>
        </TabsContent>

        <TabsContent value="fishing">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-xl p-6 border border-indigo-500/20"
          >
            <div className="mb-4">
              <h3 className="text-xl font-bold text-white mb-2">🎣 Fishing Dock</h3>
              <p className="text-slate-400 text-sm">
                Cast your line into mysterious waters. Catch rare Pokémon and discover treasures!
              </p>
            </div>
            <FishingPage />
          </motion.div>
        </TabsContent>

        <TabsContent value="lab">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-xl p-6 border border-indigo-500/20"
          >
            <div className="mb-4">
              <h3 className="text-xl font-bold text-white mb-2">🔬 Maple's Lab</h3>
              <p className="text-slate-400 text-sm">
                Research and discovery await. Professor Maple can help unlock your Pokémon's potential.
              </p>
            </div>
            <MaplesLabPage />
          </motion.div>
        </TabsContent>

        <TabsContent value="endgame">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-xl p-6 border border-indigo-500/20"
          >
            <div className="mb-4">
              <h3 className="text-xl font-bold text-white mb-2">👑 Endgame Challenges</h3>
              <p className="text-slate-400 text-sm">
                Face legendary trials, prestige systems, and ultimate challenges. Only the strongest prevail.
              </p>
            </div>
            <EndgamePage />
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}