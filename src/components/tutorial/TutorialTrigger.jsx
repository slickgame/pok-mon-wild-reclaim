import { useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';

// In-memory set to avoid re-triggering the same tutorial in the same session
const triggeredThisSession = new Set();

/**
 * Hook to trigger tutorials based on game events.
 * Uses session-level deduplication to avoid hammering the API.
 */
export function useTutorialTrigger() {
  const queryClient = useQueryClient();

  const triggerTutorial = async (triggerName) => {
    // Skip if already triggered this session
    if (triggeredThisSession.has(triggerName)) return;
    triggeredThisSession.add(triggerName);

    try {
      const tutorials = await base44.entities.Tutorial.filter({ 
        trigger: triggerName,
        isCompleted: false,
        isSkipped: false
      });

      if (tutorials.length > 0) {
        queryClient.invalidateQueries({ queryKey: ['tutorials'] });
      }
    } catch (error) {
      // Remove from set on error so it can be retried later
      triggeredThisSession.delete(triggerName);
      console.warn('Failed to trigger tutorial:', triggerName, error?.message);
    }
  };

  return { triggerTutorial };
}

export default function TutorialTrigger() {
  return null;
}