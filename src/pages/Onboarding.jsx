import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Sparkles, Zap } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { generateRandomIVs, calculateAllStats } from '@/components/pokemon/statCalculations';
import { getBaseStats } from '@/components/pokemon/baseStats';

const storySteps = [
  {
    id: 1,
    title: 'The Rewilding',
    content: 'Humanity vanished a century ago. Nature reclaimed the world, and Pokémon roam free once more. You awaken in a quiet glade.',
    image: '🌍'
  },
  {
    id: 2,
    title: 'Professor Maple',
    content: '"Ah, you\'re awake. Welcome back… or forward. It\'s hard to say these days. The world is quieter now, but it\'s still alive. Still wild. Still worth saving."',
    image: '👩‍🔬'
  },
  {
    id: 3,
    title: 'Your Companions',
    content: '"I\'ve prepared a trio of companions for you — each with a role to play. Charmander — fierce and fast. Bulbasaur — nurturing and clever. Squirtle — sturdy and patient."',
    image: '✨'
  },
  {
    id: 4,
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
          gold: 100,
          discoveredZones: ['Verdant Hollow'],
          unlockedRecipes: [],
          craftingLevel: 1,
          craftingXp: 0,
          professionLevel: 1,
          professionXp: 0,
          activeQuests: [],
          hasSeenIntro: true
        });

        // Create starter Pokémon with IVs, EVs, and calculated stats
        const starterSpecies = [
          { species: 'Charmander', type1: 'Fire', nature: 'Adamant', roles: ['Striker'] },
          { species: 'Bulbasaur', type1: 'Grass', type2: 'Poison', nature: 'Modest', roles: ['Medic', 'Support'] },
          { species: 'Squirtle', type1: 'Water', nature: 'Bold', roles: ['Tank'] }
        ];

        const starters = starterSpecies.map(starter => {
          const ivs = generateRandomIVs();
          const evs = { hp: 0, atk: 0, def: 0, spAtk: 0, spDef: 0, spd: 0 };
          const baseStats = getBaseStats(starter.species);
          const stats = calculateAllStats({ level: 5, nature: starter.nature, ivs, evs }, baseStats);

          // Auto-learn level-appropriate moves
          let starterMoves = [];
          if (starter.species === 'Charmander') {
            starterMoves = ['Scratch', 'Growl', 'Ember'];
          } else if (starter.species === 'Bulbasaur') {
            starterMoves = ['Tackle', 'Growl', 'Vine Whip'];
          } else if (starter.species === 'Squirtle') {
            starterMoves = ['Tackle', 'Tail Whip', 'Water Gun'];
          }

          return {
            species: starter.species,
            level: 5,
            nature: starter.nature,
            ivs,
            evs,
            stats,
            currentHp: stats.hp,
            type1: starter.type1,
            type2: starter.type2,
            roles: starter.roles,
            isInTeam: true,
            isStarter: true,
            experience: 0,
            talents: [],
            abilities: starterMoves
          };
        });

        const createdStarters = await base44.entities.Pokemon.bulkCreate(starters);
        
        // Initialize player's party order with starter Pokemon IDs
        const players = await base44.entities.Player.filter({ created_by: user.email });
        if (players[0] && createdStarters.length > 0) {
          await base44.entities.Player.update(players[0].id, {
            partyOrder: createdStarters.map(s => s.id)
          });
        }

        // Check if Verdant Hollow zone already exists
        const existingZones = await base44.entities.Zone.filter({ name: 'Verdant Hollow' });
        let verdantHollow;
        
        if (existingZones.length === 0) {
          // Create default zone with 0 discovery progress
          verdantHollow = await base44.entities.Zone.create({
            name: 'Verdant Hollow',
            biomeType: 'Forest',
            description: 'A tranquil forest where your journey begins. Sunlight filters through ancient trees, and the air is filled with the songs of Pokémon.',
            availableWildPokemon: [
              { species: 'Pidgey', minLevel: 2, maxLevel: 5, rarity: 'Common' },
              { species: 'Rattata', minLevel: 2, maxLevel: 4, rarity: 'Common' },
              { species: 'Caterpie', minLevel: 2, maxLevel: 4, rarity: 'Common' }
            ],
            nodelets: [],
            discoveryProgress: 0,
            requiredLevel: 1
          });
        } else {
          verdantHollow = existingZones[0];
        }

        // Create initial ZoneProgress with 0 discovery (only if doesn't exist)
        const existingProgress = await base44.entities.ZoneProgress.filter({ zoneId: verdantHollow.id });
        if (existingProgress.length === 0) {
          await base44.entities.ZoneProgress.create({
            zoneId: verdantHollow.id,
            zoneName: 'Verdant Hollow',
            discoveryProgress: 0,
            discoveredPokemon: [],
            discoveredPOIs: [],
            discoveredMaterials: [],
            explorationCount: 0
          });
        }

        // Initialize tutorial sequence with Professor Maple's guidance
        const tutorials = [
          {
            stepId: 'companions',
            title: 'Your Companions',
            content: '"Charmander — fierce and fast. A striker. Bulbasaur — nurturing and clever. A healer. Squirtle — sturdy and patient. A shield. Use them wisely."',
            type: 'story',
            trigger: 'onboarding',
            priority: 1,
            speaker: 'Maple',
            action: 'View Team',
            actionTarget: 'Pokemon'
          },
          {
            stepId: 'exploration',
            title: 'First Exploration',
            content: '"This place is called Verdant Hollow. It\'s one of the last stable zones. But even here, data is scarce. Exploration is our first task."',
            type: 'instruction',
            trigger: 'first_exploration',
            priority: 2,
            speaker: 'Maple',
            action: 'Start Exploring',
            actionTarget: 'Zones'
          },
          {
            stepId: 'battle',
            title: 'First Battle',
            content: '"Fascinating! A wild encounter already. You\'ll need to think ahead. Who do you lead with? What\'s their role?"',
            type: 'instruction',
            trigger: 'first_battle',
            priority: 3,
            speaker: 'Maple'
          },
          {
            stepId: 'victory',
            title: 'Victory!',
            content: 'Your Pokémon gained experience! They grow stronger with each battle. Keep training them to unlock their full potential.',
            type: 'unlock',
            trigger: 'first_victory',
            priority: 4
          },
          {
            stepId: 'material',
            title: 'First Item Found',
            content: '"Looks like you found some usable materials. These can be turned into tools, traps, even recovery items. You\'ll learn more soon."',
            type: 'tip',
            trigger: 'first_material',
            priority: 5,
            speaker: 'Maple',
            action: 'View Crafting',
            actionTarget: 'Crafting'
          },
          {
            stepId: 'poi_discovered',
            title: 'Point of Interest',
            content: '"The forest remembers. Places like this carry echoes. Mark this location. It may hold secrets or tasks left behind."',
            type: 'tip',
            trigger: 'first_quest',
            priority: 6,
            speaker: 'Maple'
          },
          {
            stepId: 'journal',
            title: 'Journal Unlocked',
            content: '"Your journal is how we make sense of the wild again. Every new entry is progress."',
            type: 'unlock',
            trigger: 'first_capture',
            priority: 7,
            speaker: 'Maple'
          }
        ];

        await base44.entities.Tutorial.bulkCreate(tutorials);

        // Give starter inventory - 10 Pokéballs
        await base44.entities.Item.create({
          name: 'Pokéball',
          type: 'Capture Gear',
          tier: 1,
          rarity: 'Common',
          description: 'A device for catching wild Pokémon',
          quantity: 10,
          stackable: true,
          sellValue: 50
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