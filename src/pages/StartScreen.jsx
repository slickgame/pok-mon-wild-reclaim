import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Sparkles, Play, Plus, Settings, AlertTriangle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { createPageUrl } from '../utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function StartScreen() {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const { data: player, isLoading } = useQuery({
    queryKey: ['player'],
    queryFn: async () => {
      const players = await base44.entities.Player.list();
      return players[0] || null;
    }
  });

  const hasSaveData = !!player;

  const handleContinue = () => {
    window.location.href = createPageUrl('Home');
  };

  const handleNewGame = async () => {
    setIsResetting(true);

    try {
      const user = await base44.auth.me();

      // Delete all existing data
      const [players, pokemon, items, zoneProgress, tutorials] = await Promise.all([
        base44.entities.Player.list(),
        base44.entities.Pokemon.list(),
        base44.entities.Item.list(),
        base44.entities.ZoneProgress.list(),
        base44.entities.Tutorial.list()
      ]);

      // Delete all records
      await Promise.all([
        ...players.map(p => base44.entities.Player.delete(p.id)),
        ...pokemon.map(p => base44.entities.Pokemon.delete(p.id)),
        ...items.map(i => base44.entities.Item.delete(i.id)),
        ...zoneProgress.map(z => base44.entities.ZoneProgress.delete(z.id)),
        ...tutorials.map(t => base44.entities.Tutorial.delete(t.id))
      ]);

      // Redirect to onboarding
      window.location.href = createPageUrl('Onboarding');
    } catch (error) {
      console.error('Failed to reset game:', error);
      setIsResetting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-0 left-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
          className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl"
        />
      </div>

      {/* Main content */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="relative z-10 max-w-xl w-full"
      >
        {/* Title */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.3 }}
            className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center shadow-2xl"
          >
            <Sparkles className="w-12 h-12 text-white" />
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-5xl md:text-6xl font-bold mb-4"
          >
            <span className="bg-gradient-to-r from-indigo-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Pokémon
            </span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-2xl md:text-3xl font-semibold text-white"
          >
            Wild Reclaim
          </motion.p>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="text-slate-400 mt-3"
          >
            A world rewilded, a journey reborn
          </motion.p>
        </div>

        {/* Menu */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
          className="space-y-4"
        >
          {/* New Game */}
          <Button
            onClick={() => hasSaveData ? setShowConfirm(true) : handleNewGame()}
            disabled={isResetting || isLoading}
            className="w-full h-16 text-lg bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 shadow-xl"
          >
            <Plus className="w-6 h-6 mr-3" />
            {isResetting ? 'Resetting...' : 'Start New Game'}
          </Button>

          {/* Continue */}
          <Button
            onClick={handleContinue}
            disabled={!hasSaveData || isLoading}
            className="w-full h-16 text-lg bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-xl disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Play className="w-6 h-6 mr-3" />
            Continue
          </Button>

          {!hasSaveData && !isLoading && (
            <p className="text-center text-slate-500 text-sm">
              No save data found
            </p>
          )}
        </motion.div>

        {/* Version/Credits */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="text-center mt-12 text-slate-600 text-sm"
        >
          <p>v1.0.0 • Built with Base44</p>
        </motion.div>
      </motion.div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent className="bg-slate-900 border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              Start New Game?
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              ⚠️ This will erase all progress including your Pokémon, items, and discoveries. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConfirm(false)}
              className="border-slate-700"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                setShowConfirm(false);
                handleNewGame();
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Erase & Start New
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}