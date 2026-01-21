import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPageUrl } from '../utils';

const storyFrames = [
  {
    id: 1,
    text: "The world we knew… is gone.",
    background: "from-slate-950 via-slate-900 to-black",
    image: "🌍"
  },
  {
    id: 2,
    text: "Cities crumbled. Humans vanished. Only traces remain.",
    background: "from-stone-900 via-slate-800 to-slate-950",
    image: "🏚️"
  },
  {
    id: 3,
    text: "But Pokémon endured. Adapted. Reclaimed what was lost.",
    background: "from-emerald-950 via-teal-900 to-slate-950",
    image: "✨"
  },
  {
    id: 4,
    text: "My name is Professor Maple. I've watched, studied… and waited.",
    background: "from-slate-900 via-indigo-950 to-slate-950",
    image: "👩‍🔬",
    speaker: true
  },
  {
    id: 5,
    text: "I created you, a bridge between what was and what could be.",
    background: "from-indigo-950 via-purple-900 to-slate-950",
    image: "🌟",
    speaker: true
  },
  {
    id: 6,
    text: "These three will be your companions. Each unique. Each powerful in their own way.",
    background: "from-amber-950 via-orange-900 to-slate-950",
    image: "🔥💧🌿",
    starters: true
  },
  {
    id: 7,
    text: "Now go. Reclaim what was wild. Rewrite what comes next.",
    background: "from-emerald-900 via-teal-800 to-cyan-900",
    image: "🌲",
    final: true
  }
];

export default function StoryCutscene() {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [canAdvance, setCanAdvance] = useState(false);

  const frame = storyFrames[currentFrame];

  // Typewriter effect
  useEffect(() => {
    if (!frame) return;
    
    setDisplayedText('');
    setIsTyping(true);
    setCanAdvance(false);
    
    let i = 0;
    const interval = setInterval(() => {
      if (i < frame.text.length) {
        setDisplayedText(frame.text.slice(0, i + 1));
        i++;
      } else {
        setIsTyping(false);
        setCanAdvance(true);
        clearInterval(interval);
      }
    }, 40);
    
    return () => clearInterval(interval);
  }, [currentFrame, frame]);

  // Auto-advance after delay
  useEffect(() => {
    if (!canAdvance) return;
    
    const timer = setTimeout(() => {
      if (currentFrame < storyFrames.length - 1) {
        setCurrentFrame(currentFrame + 1);
      } else {
        // Cutscene complete, go to onboarding
        window.location.href = createPageUrl('Onboarding');
      }
    }, 2500);
    
    return () => clearTimeout(timer);
  }, [canAdvance, currentFrame]);

  // Allow click/tap to skip
  const handleSkip = () => {
    if (isTyping) {
      setDisplayedText(frame.text);
      setIsTyping(false);
      setCanAdvance(true);
    } else if (canAdvance) {
      if (currentFrame < storyFrames.length - 1) {
        setCurrentFrame(currentFrame + 1);
      } else {
        window.location.href = createPageUrl('Onboarding');
      }
    }
  };

  if (!frame) return null;

  return (
    <div 
      onClick={handleSkip}
      className={`min-h-screen bg-gradient-to-br ${frame.background} flex items-center justify-center p-4 cursor-pointer relative overflow-hidden`}
    >
      {/* Ambient animation */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.3, 0.1],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute inset-0 bg-gradient-radial from-white/5 to-transparent"
      />

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={frame.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 max-w-3xl text-center"
        >
          {/* Image/Icon */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, type: 'spring' }}
            className="text-8xl mb-8 drop-shadow-2xl"
          >
            {frame.starters ? (
              <div className="flex justify-center gap-8">
                <motion.span
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0 }}
                >
                  🔥
                </motion.span>
                <motion.span
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
                >
                  💧
                </motion.span>
                <motion.span
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
                >
                  🌿
                </motion.span>
              </div>
            ) : (
              frame.image
            )}
          </motion.div>

          {/* Speaker badge */}
          {frame.speaker && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className="mb-4"
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/20 text-emerald-300 text-sm border border-emerald-500/30">
                <span>👩‍🔬</span>
                <span>Professor Maple</span>
              </span>
            </motion.div>
          )}

          {/* Text */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-3xl md:text-4xl font-bold text-white leading-relaxed drop-shadow-lg px-4"
          >
            {displayedText}
            {isTyping && (
              <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.5, repeat: Infinity }}
                className="inline-block w-1 h-8 bg-white ml-1 align-middle"
              />
            )}
          </motion.p>

          {/* Progress indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2"
          >
            {storyFrames.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentFrame
                    ? 'bg-white w-8'
                    : index < currentFrame
                    ? 'bg-white/50'
                    : 'bg-white/20'
                }`}
              />
            ))}
          </motion.div>

          {/* Skip hint */}
          {canAdvance && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute bottom-20 left-1/2 -translate-x-1/2 text-slate-400 text-sm"
            >
              Click or tap to continue
            </motion.p>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}