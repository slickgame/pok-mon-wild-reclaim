import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Sparkles, MapPin, Zap, Heart } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';

const storySteps = [
  {
    id: 1,
    title: 'The Rewilding',
    content: 'Humanity vanished a century ago. Nature reclaimed the world, and Pokémon roam free once more. You awaken as a lone traveler in this wild paradise.',
    image: '🌍'
  },
  {
    id: 2,
    title: 'Your Companions',
    content: 'Three young Pokémon find you: Charmander, Bulbasaur, and Squirtle. They sense something special in you—a connection to the old world.',
    image: '✨'
  },
  {
    id: 3,
    title: 'The Call',
    content: 'A strange energy pulses across the land. Team Eclipse has begun corrupting Pokémon into Revenants. Your journey begins now.',
    image: '⚡'
  }
];

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const currentStep = storySteps[step];

  const handleNext = () => {
    if (step < storySteps.length - 1) {
      setStep(step + 1);
    } else {
      initializeGame();
    }
  };

  const initializeGame = async () => {
    setLoading(true);
    
    try {
      const user = await base44.auth.me();
      
      // Check if player already exists
      const existingPlayers = await base44.entities.Player.filter({ created_by: user.email });
      
      if (existingPlayers.length === 0) {
        // Create new player
        await base44.entities.Player.create({
          name: user.full_name || 'Traveler',
          currentLocation: 'Verdant Hollow',
          gold: 0,
          discoveredZones: ['Verdant Hollow'],
          unlockedRecipes: [],
          craftingLevel: 1,
          craftingXp: 0,
          professionLevel: 1,
          professionXp: 0
        });

        // Create starter Pokémon
        const starters = [
          {
            species: 'Charmander',
            level: 5,
            stats: {
              hp: 39,
              maxHp: 39,
              atk: 52,
              def: 43,
              spAtk: 60,
              spDef: 50,
              spd: 65
            },
            type1: 'Fire',
            roles: ['Striker'],
            isInTeam: true,
            isStarter: true,
            experience: 0,
            talents: []
          },
          {
            species: 'Bulbasaur',
            level: 5,
            stats: {
              hp: 45,
              maxHp: 45,
              atk: 49,
              def: 49,
              spAtk: 65,
              spDef: 65,
              spd: 45
            },
            type1: 'Grass',
            type2: 'Poison',
            roles: ['Medic', 'Support'],
            isInTeam: true,
            isStarter: true,
            experience: 0,
            talents: []
          },
          {
            species: 'Squirtle',
            level: 5,
            stats: {
              hp: 44,
              maxHp: 44,
              atk: 48,
              def: 65,
              spAtk: 50,
              spDef: 64,
              spd: 43
            },
            type1: 'Water',
            roles: ['Tank'],
            isInTeam: true,
            isStarter: true,
            experience: 0,
            talents: []
          }
        ];

        await base44.entities.Pokemon.bulkCreate(starters);

        // Initialize first tutorial
        await base44.entities.Tutorial.create({
          stepId: 'welcome',
          title: 'Welcome to Wild Reclaim',
          content: 'Explore the world, discover Pokémon, and uncover the mystery of Team Eclipse. Start by exploring Verdant Hollow!',
          trigger: 'first_zone',
          isCompleted: false
        });
      }
      
      // Navigate to home
      window.location.href = createPageUrl('Home');
    } catch (error) {
      console.error('Failed to initialize game:', error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          className="max-w-2xl w-full"
        >
          <div className="glass rounded-3xl p-8 md:p-12 border-2 border-indigo-500/30">
            {/* Story Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
              className="text-8xl text-center mb-8"
            >
              {currentStep.image}
            </motion.div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-white text-center mb-4">
              {currentStep.title}
            </h1>

            {/* Content */}
            <p className="text-lg text-slate-300 text-center mb-8 leading-relaxed">
              {currentStep.content}
            </p>

            {/* Progress Dots */}
            <div className="flex justify-center gap-2 mb-8">
              {storySteps.map((s, idx) => (
                <div
                  key={s.id}
                  className={`w-2 h-2 rounded-full transition-all ${
                    idx === step
                      ? 'bg-indigo-500 w-8'
                      : idx < step
                      ? 'bg-indigo-500/50'
                      : 'bg-slate-700'
                  }`}
                />
              ))}
            </div>

            {/* Action Button */}
            <Button
              onClick={handleNext}
              disabled={loading}
              className="w-full h-14 text-lg bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
            >
              {loading ? (
                'Preparing your journey...'
              ) : step < storySteps.length - 1 ? (
                <>
                  Continue
                  <Sparkles className="w-5 h-5 ml-2" />
                </>
              ) : (
                <>
                  Begin Your Journey
                  <Zap className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>

            {step === 0 && (
              <p className="text-center text-slate-500 text-sm mt-4">
                A story-driven adventure awaits
              </p>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}