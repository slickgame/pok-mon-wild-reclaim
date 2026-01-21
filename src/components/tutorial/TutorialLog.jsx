import React from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Book, Check, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import PageHeader from '@/components/common/PageHeader';

export default function TutorialLog() {
  const { data: tutorials = [], isLoading } = useQuery({
    queryKey: ['tutorials'],
    queryFn: () => base44.entities.Tutorial.list()
  });

  const completedCount = tutorials.filter(t => t.isCompleted).length;

  return (
    <div>
      <PageHeader
        title="Tutorial Log"
        subtitle={`${completedCount}/${tutorials.length} completed`}
        icon={Book}
      />

      <div className="space-y-3">
        {tutorials.map((tutorial, idx) => (
          <motion.div
            key={tutorial.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className={`glass rounded-xl p-4 border ${
              tutorial.isCompleted
                ? 'border-emerald-500/30'
                : tutorial.isSkipped
                ? 'border-slate-600'
                : 'border-indigo-500/30'
            }`}
          >
            <div className="flex items-start gap-3">
              {/* Icon */}
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  tutorial.isCompleted
                    ? 'bg-emerald-500/20'
                    : tutorial.isSkipped
                    ? 'bg-slate-700'
                    : 'bg-indigo-500/20'
                }`}
              >
                {tutorial.isCompleted ? (
                  <Check className="w-5 h-5 text-emerald-400" />
                ) : tutorial.isSkipped ? (
                  <X className="w-5 h-5 text-slate-400" />
                ) : (
                  <Book className="w-5 h-5 text-indigo-400" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-1">
                  <h3 className="text-white font-semibold">{tutorial.title}</h3>
                  <Badge
                    className={
                      tutorial.isCompleted
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : tutorial.isSkipped
                        ? 'bg-slate-700 text-slate-400'
                        : 'bg-indigo-500/20 text-indigo-300'
                    }
                  >
                    {tutorial.isCompleted
                      ? 'Completed'
                      : tutorial.isSkipped
                      ? 'Skipped'
                      : 'Pending'}
                  </Badge>
                </div>
                <p className="text-slate-400 text-sm">{tutorial.content}</p>
              </div>
            </div>
          </motion.div>
        ))}

        {tutorials.length === 0 && (
          <div className="glass rounded-xl p-8 text-center">
            <Book className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">No tutorials available yet</p>
          </div>
        )}
      </div>
    </div>
  );
}