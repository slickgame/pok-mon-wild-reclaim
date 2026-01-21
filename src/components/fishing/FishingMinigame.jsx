import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Waves, Zap, Fish } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function FishingMinigame({ onComplete, difficulty = 1 }) {
  const [phase, setPhase] = useState('waiting'); // waiting, biting, caught, missed
  const [progress, setProgress] = useState(0);
  const [biteWindow, setBiteWindow] = useState(false);

  useEffect(() => {
    if (phase === 'waiting') {
      const waitTime = 2000 + Math.random() * 3000; // 2-5 seconds
      const timer = setTimeout(() => {
        setBiteWindow(true);
        setPhase('biting');
        
        // Window to react (shorter for higher difficulty)
        const reactionWindow = Math.max(800, 2000 - (difficulty * 200));
        setTimeout(() => {
          if (biteWindow) {
            setPhase('missed');
            setTimeout(() => onComplete({ success: false }), 1000);
          }
        }, reactionWindow);
      }, waitTime);
      return () => clearTimeout(timer);
    }
  }, [phase, difficulty]);

  const handleHook = () => {
    if (phase === 'biting' && biteWindow) {
      setBiteWindow(false);
      setPhase('caught');
      // Success animation
      let currentProgress = 0;
      const interval = setInterval(() => {
        currentProgress += 5;
        setProgress(currentProgress);
        if (currentProgress >= 100) {
          clearInterval(interval);
          setTimeout(() => onComplete({ success: true }), 500);
        }
      }, 50);
    } else if (phase === 'waiting') {
      // Too early
      setPhase('missed');
      setTimeout(() => onComplete({ success: false, reason: 'too_early' }), 1000);
    }
  };

  return (
    <div className="glass rounded-xl p-8 text-center">
      <AnimatePresence mode="wait">
        {phase === 'waiting' && (
          <motion.div
            key="waiting"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Waves className="w-16 h-16 mx-auto mb-4 text-cyan-400 animate-pulse" />
            <p className="text-white text-lg mb-2">Waiting for a bite...</p>
            <p className="text-sm text-slate-400">Watch for the splash!</p>
          </motion.div>
        )}

        {phase === 'biting' && (
          <motion.div
            key="biting"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.3, repeat: Infinity }}
            >
              <Zap className="w-20 h-20 mx-auto mb-4 text-yellow-400" />
            </motion.div>
            <p className="text-white text-2xl font-bold mb-4">HOOK NOW!</p>
            <Button
              onClick={handleHook}
              className="bg-gradient-to-r from-yellow-500 to-orange-500 text-lg px-8 py-6"
            >
              🎣 Hook It!
            </Button>
          </motion.div>
        )}

        {phase === 'caught' && (
          <motion.div
            key="caught"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Fish className="w-16 h-16 mx-auto mb-4 text-emerald-400" />
            <p className="text-white text-xl mb-4">Reeling in...</p>
            <div className="w-full h-4 bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </motion.div>
        )}

        {phase === 'missed' && (
          <motion.div
            key="missed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="text-6xl mb-4">💧</div>
            <p className="text-slate-400 text-lg">Got away...</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}