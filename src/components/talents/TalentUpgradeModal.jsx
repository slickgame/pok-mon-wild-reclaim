import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, AlertCircle, TrendingUp, RefreshCw, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import TalentTooltip from '@/components/talents/TalentTooltip';

const gradeColors = {
  F: 'bg-gray-700/30 text-gray-400 border-gray-600/50',
  D: 'bg-amber-900/30 text-amber-500 border-amber-700/50',
  C: 'bg-amber-700/30 text-amber-400 border-amber-600/50',
  B: 'bg-slate-400/30 text-slate-200 border-slate-400/50',
  A: 'bg-yellow-500/30 text-yellow-300 border-yellow-500/50',
  S: 'bg-cyan-400/30 text-cyan-200 border-cyan-400/50',
};

const gradeOrder = ['F', 'D', 'C', 'B', 'A', 'S'];

export default function TalentUpgradeModal({ 
  open, 
  onClose, 
  talent, 
  upgradeType, 
  onConfirm,
  playerInventory = []
}) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);

  const currentGradeIndex = gradeOrder.indexOf(talent?.grade || 'F');
  const nextGrade = currentGradeIndex < gradeOrder.length - 1 ? gradeOrder[currentGradeIndex + 1] : null;

  const getUpgradeInfo = () => {
    switch (upgradeType) {
      case 'reroll':
        return {
          title: 'Re-Roll Talent',
          description: 'Replace this talent with a new random one. Grade will be randomized.',
          requiredItem: 'Talent Crystal (Minor)',
          successRate: 100,
          icon: RefreshCw,
          color: 'from-purple-500 to-indigo-500',
        };
      case 'grade':
        return {
          title: 'Upgrade Grade',
          description: `Attempt to upgrade this talent to grade ${nextGrade || 'MAX'}`,
          requiredItem: 'Master Training Scroll',
          successRate: 70,
          icon: TrendingUp,
          color: 'from-emerald-500 to-cyan-500',
        };
      case 'bond':
        return {
          title: 'Bond Upgrade',
          description: 'Your strong bond guarantees a grade upgrade!',
          requiredItem: 'Max Friendship',
          successRate: 100,
          icon: Sparkles,
          color: 'from-pink-500 to-yellow-500',
        };
      case 'forge':
        return {
          title: 'Talent Forge',
          description: 'Use rare reagents for a high-quality upgrade',
          requiredItem: '3-5 Reagents',
          successRate: 85,
          icon: Zap,
          color: 'from-orange-500 to-red-500',
        };
      default:
        return null;
    }
  };

  const handleConfirm = async () => {
    setIsProcessing(true);
    
    // Simulate processing
    setTimeout(() => {
      const random = Math.random() * 100;
      const info = getUpgradeInfo();
      
      if (upgradeType === 'grade') {
        if (random <= 70) {
          setResult({ success: true, message: `Talent upgraded to grade ${nextGrade}!` });
        } else if (random <= 95) {
          setResult({ success: false, message: 'Upgrade failed. Talent unchanged.' });
        } else {
          setResult({ success: false, message: 'Critical failure! Grade decreased.', downgrade: true });
        }
      } else if (upgradeType === 'reroll') {
        setResult({ success: true, message: 'Talent re-rolled successfully!', newTalent: 'Fire Shield [B]' });
      } else {
        setResult({ success: true, message: `Talent upgraded to grade ${nextGrade}!` });
      }
      
      setTimeout(() => {
        if (result?.success) {
          onConfirm(talent, upgradeType);
        }
        setIsProcessing(false);
        setResult(null);
        onClose();
      }, 2000);
    }, 1500);
  };

  const info = getUpgradeInfo();
  if (!info) return null;

  const Icon = info.icon;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-slate-800">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${info.color} flex items-center justify-center`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            {info.title}
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            {info.description}
          </DialogDescription>
        </DialogHeader>

        {!result ? (
          <div className="space-y-4">
            {/* Current Talent */}
            <div className="glass rounded-lg p-4">
              <h4 className="text-sm text-slate-400 mb-2">Current Talent</h4>
              <div className="flex items-center justify-between">
                <TalentTooltip talent={talent}>
                  <span className="text-white font-semibold">{talent.name}</span>
                </TalentTooltip>
                <Badge className={gradeColors[talent.grade]}>{talent.grade}</Badge>
              </div>
              <p className="text-xs text-slate-400 mt-2">{talent.description}</p>
            </div>

            {/* Requirements */}
            <div className="glass rounded-lg p-4">
              <h4 className="text-sm text-slate-400 mb-2">Requirements</h4>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-white">{info.requiredItem}</span>
                <Badge className="bg-emerald-500/20 text-emerald-300">Available</Badge>
              </div>
              {upgradeType === 'grade' && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white">Success Rate</span>
                  <span className="text-sm text-slate-300">{info.successRate}%</span>
                </div>
              )}
            </div>

            {/* Warning for risky upgrades */}
            {upgradeType === 'grade' && (
              <div className="flex items-start gap-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                <AlertCircle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-yellow-300">
                  <p className="font-semibold mb-1">Upgrade Risk</p>
                  <p>70% success, 25% no change, 5% downgrade</p>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={onClose}
                className="flex-1 border-slate-700 text-slate-300"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleConfirm}
                disabled={isProcessing}
                className={`flex-1 bg-gradient-to-r ${info.color} hover:opacity-90`}
              >
                {isProcessing ? 'Processing...' : 'Confirm'}
              </Button>
            </div>
          </div>
        ) : (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`glass rounded-xl p-8 text-center ${
              result.success ? 'border-2 border-emerald-500' : 'border-2 border-red-500'
            }`}
          >
            {result.success ? (
              <>
                <Sparkles className="w-16 h-16 mx-auto mb-4 text-emerald-400" />
                <h3 className="text-xl font-bold text-white mb-2">Success!</h3>
                <p className="text-slate-300">{result.message}</p>
                {result.newTalent && (
                  <Badge className="mt-3 bg-cyan-500/20 text-cyan-300 border-cyan-500/50">
                    {result.newTalent}
                  </Badge>
                )}
              </>
            ) : (
              <>
                <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-400" />
                <h3 className="text-xl font-bold text-white mb-2">
                  {result.downgrade ? 'Critical Failure' : 'Failed'}
                </h3>
                <p className="text-slate-300">{result.message}</p>
              </>
            )}
          </motion.div>
        )}
      </DialogContent>
    </Dialog>
  );
}
