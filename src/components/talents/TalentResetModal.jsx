import React, { useState } from 'react';
import { RotateCcw, AlertTriangle, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function TalentResetModal({ 
  open, 
  onClose, 
  talents, 
  onConfirm,
  hasPreservationToken = false
}) {
  const [selectedToPreserve, setSelectedToPreserve] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleConfirm = () => {
    setIsProcessing(true);
    setTimeout(() => {
      onConfirm(selectedToPreserve);
      setIsProcessing(false);
      onClose();
    }, 1500);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-slate-800 max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
              <RotateCcw className="w-5 h-5 text-white" />
            </div>
            Full Talent Reset
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Reset all talents to new random ones. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Warning */}
          <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/30 rounded-lg p-4">
            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-red-300">
              <p className="font-semibold mb-1">High Risk Operation</p>
              <p>All current talents will be replaced with new random talents. You may lose high-grade talents!</p>
            </div>
          </div>

          {/* Current Talents */}
          <div className="glass rounded-lg p-4">
            <h4 className="text-sm text-slate-400 mb-3">Current Talents</h4>
            <div className="space-y-2">
              {talents.map((talent, idx) => (
                <div key={idx} className="flex items-center justify-between bg-slate-800/50 rounded-lg p-3">
                  <div className="flex items-center gap-3 flex-1">
                    {hasPreservationToken && (
                      <Checkbox
                        checked={selectedToPreserve === idx}
                        onCheckedChange={() => setSelectedToPreserve(selectedToPreserve === idx ? null : idx)}
                      />
                    )}
                    <div>
                      <p className="text-white text-sm font-medium">{talent.name}</p>
                      <p className="text-xs text-slate-400">{talent.description}</p>
                    </div>
                  </div>
                  <Badge className={`ml-2 ${
                    talent.grade === 'S' ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50' :
                    talent.grade === 'A' ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50' :
                    'bg-slate-700/50 text-slate-300'
                  }`}>
                    {talent.grade}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Preservation Token */}
          {hasPreservationToken && (
            <div className="flex items-start gap-2 bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-3">
              <Lock className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-cyan-300">
                <p className="font-semibold mb-1">Preservation Token Active</p>
                <p>Select one talent to keep during the reset</p>
              </div>
            </div>
          )}

          {/* Required Item */}
          <div className="glass rounded-lg p-4">
            <h4 className="text-sm text-slate-400 mb-2">Required Item</h4>
            <div className="flex items-center justify-between">
              <span className="text-sm text-white">Talent Essence</span>
              <Badge className="bg-emerald-500/20 text-emerald-300">x1 Available</Badge>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="flex-1 border-slate-700 text-slate-300"
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleConfirm}
              disabled={isProcessing}
              className="flex-1 bg-gradient-to-r from-red-500 to-orange-500 hover:opacity-90"
            >
              {isProcessing ? 'Resetting...' : 'Reset All Talents'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}