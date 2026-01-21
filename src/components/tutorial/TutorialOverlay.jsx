import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Sparkles, X, ChevronRight, BookOpen, Lightbulb, Unlock, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../../utils';

const typeIcons = {
  story: Sparkles,
  instruction: BookOpen,
  tip: Lightbulb,
  unlock: Unlock
};

const typeColors = {
  story: 'from-purple-500 to-pink-500',
  instruction: 'from-indigo-500 to-cyan-500',
  tip: 'from-amber-500 to-orange-500',
  unlock: 'from-emerald-500 to-teal-500'
};

export default function TutorialOverlay({ tutorial, onComplete, onSkip }) {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!tutorial) return;
    
    setDisplayedText('');
    setIsTyping(true);
    
    if (tutorial.type === 'story' || tutorial.speaker === 'Maple') {
      // Typewriter effect for story tutorials and Maple's dialogue
      let i = 0;
      const interval = setInterval(() => {
        if (i < tutorial.content.length) {
          setDisplayedText(tutorial.content.slice(0, i + 1));
          i++;
        } else {
          setIsTyping(false);
          clearInterval(interval);
        }
      }, 25);
      
      return () => clearInterval(interval);
    } else {
      // Instant display for other types
      setDisplayedText(tutorial.content);
      setIsTyping(false);
    }
  }, [tutorial]);

  if (!tutorial) return null;

  const Icon = typeIcons[tutorial.type] || BookOpen;
  const colorClass = typeColors[tutorial.type] || typeColors.instruction;
  const showMaple = tutorial.speaker === 'Maple';

  const handleAction = () => {
    if (tutorial.actionTarget) {
      navigate(createPageUrl(tutorial.actionTarget));
    }
    onComplete();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.8, y: 50 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.8, y: 50 }}
          className="glass rounded-2xl p-6 max-w-md w-full border-2 border-indigo-500/50 relative overflow-hidden"
        >
          {/* Background glow */}
          <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br ${colorClass} opacity-10 rounded-full blur-3xl`} />
          
          {/* Header */}
          <div className="relative z-10 flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              {showMaple ? (
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg border-2 border-emerald-400/50">
                  <span className="text-2xl">👩‍🔬</span>
                </div>
              ) : (
                <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${colorClass} flex items-center justify-center shadow-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              )}
              <div>
                {showMaple ? (
                  <Badge className="bg-emerald-500/20 text-emerald-300 text-xs mb-1 border border-emerald-500/30">
                    👩‍🔬 Professor Maple
                  </Badge>
                ) : (
                  <Badge className={`bg-gradient-to-r ${colorClass} text-white text-xs mb-1`}>
                    {tutorial.type === 'story' ? '📖 Story' : 
                     tutorial.type === 'tip' ? '💡 Tip' : 
                     tutorial.type === 'unlock' ? '🆕 Unlocked' : 
                     '📘 Tutorial'}
                  </Badge>
                )}
                <h3 className="text-xl font-bold text-white">{tutorial.title}</h3>
              </div>
            </div>
            <button
              onClick={onSkip}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="relative z-10 mb-6">
            <p className="text-slate-300 leading-relaxed text-base">
              {displayedText}
              {isTyping && <span className="animate-pulse">▊</span>}
            </p>
          </div>

          {/* Actions */}
          <div className="relative z-10 flex gap-3">
            <Button
              onClick={onSkip}
              variant="outline"
              className="border-slate-700 text-slate-300"
            >
              Skip All
            </Button>
            <Button
              onClick={handleAction}
              disabled={isTyping}
              className={`flex-1 bg-gradient-to-r ${colorClass} hover:opacity-90`}
            >
              {tutorial.action || 'Got It'}
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}