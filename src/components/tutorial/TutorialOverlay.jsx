import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Sparkles, X, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function TutorialOverlay({ tutorial, onComplete, onSkip }) {
  if (!tutorial) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.8, y: 50 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.8, y: 50 }}
          className="glass rounded-2xl p-6 max-w-md w-full border-2 border-indigo-500/50"
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <Badge className="bg-indigo-500/20 text-indigo-300 text-xs mb-1">
                  Tutorial
                </Badge>
                <h3 className="text-lg font-bold text-white">{tutorial.title}</h3>
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
          <div className="mb-6">
            <p className="text-slate-300 leading-relaxed">{tutorial.content}</p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              onClick={onSkip}
              variant="outline"
              className="flex-1"
            >
              Skip All Tutorials
            </Button>
            <Button
              onClick={onComplete}
              className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
            >
              Got It
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}