import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from './utils';
import { Home, PawPrint, Map, Backpack, FlaskConical, Users, Menu, X, Sparkles, Swords, Trophy, Fish, Crown, Box, BookOpen, UserCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import TimeWidget from '@/components/time/TimeWidget';
import { formatCalendarDate, formatDigitalTime, normalizeGameTime } from '@/components/systems/time/gameTimeSystem';

const navItems = [
  { name: 'Home', icon: Home, page: 'Home' },
  { name: 'Main Menu', icon: Menu, page: 'StartScreen' },
  { name: 'Party', icon: Users, page: 'PartyManager' },
  { name: 'Pokémon', icon: PawPrint, page: 'Pokemon' },
  { name: 'Pokédex', icon: BookOpen, page: 'Pokedex' },
  { name: 'Storage', icon: Box, page: 'Storage' },
  { name: 'Town', icon: Home, page: 'Town' },
  { name: 'Zones', icon: Map, page: 'Zones' },
  { name: 'Inventory', icon: Backpack, page: 'Inventory' },
  { name: 'Player', icon: UserCircle, page: 'Player' },
  { name: 'Tutorials', icon: Sparkles, page: 'TutorialLog' },
];

const noLayoutPages = ['StartScreen', 'StoryCutscene', 'Onboarding'];

export default function Layout({ children, currentPageName }) {
  // Don't show layout for start screen and onboarding
  if (noLayoutPages.includes(currentPageName)) {
    return children;
  }
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const inZoneDetail = currentPageName === 'Zones' && location.search.includes('zoneId=');

  const { data: gameTime } = useQuery({
      queryKey: ['gameTime'],
      queryFn: async () => {
        const times = await base44.entities.GameTime.list();
        return times[0] || null;
      },
      refetchInterval: 5000, // Refresh every 5 seconds so sidebar stays current
    });

  const { data: player } = useQuery({
    queryKey: ['playerSidebarSummary'],
    queryFn: async () => {
      const players = await base44.entities.Player.list();
      return players[0] || null;
    },
    refetchInterval: 30000,
  });

  const playerName = player?.name || 'Traveler';
  const playerGold = player?.gold ?? 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <style dangerouslySetInnerHTML={{
        __html: `
        :root {
          --primary: #6366f1;
          --primary-light: #818cf8;
          --accent: #22d3ee;
          --success: #34d399;
          --warning: #fbbf24;
          --danger: #f87171;
          --surface: rgba(15, 23, 42, 0.8);
          --surface-light: rgba(30, 41, 59, 0.8);
        }
        
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        
        .shimmer {
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
          background-size: 200% 100%;
          animation: shimmer 2s infinite;
        }
        
        .glass {
          background: rgba(15, 23, 42, 0.7);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(99, 102, 241, 0.2);
        }
        
        .glow {
          box-shadow: 0 0 20px rgba(99, 102, 241, 0.3);
        }
      `}} />

      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-20 lg:w-64 glass z-50 hidden md:flex flex-col overflow-y-auto">
        <div className="p-4 lg:p-6 border-b border-indigo-500/20">
          <Link to={createPageUrl('Home')} className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center glow">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="hidden lg:block text-xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
              Wild Reclaim
            </span>
          </Link>
        </div>
        
        <nav className="flex-1 p-3 lg:p-4 space-y-2">
          {navItems.map((item) => {
              const isActive = currentPageName === item.page;
              const isBattlePage = currentPageName === 'Battle';
              const isZoneLocked = inZoneDetail && item.page !== 'StartScreen';
              const isDisabled = (isBattlePage && item.page !== 'Battle') || isZoneLocked;

              return (
                <Link
                  key={item.page}
                  to={createPageUrl(item.page)}
                  onClick={(e) => {
                    if (isDisabled) {
                      e.preventDefault();
                      alert(isBattlePage
                        ? '⚔️ You cannot leave during an active battle!'
                        : '🌲 You cannot leave the zone while exploring. Return to town or the main menu first.'
                      );
                    }
                  }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden ${
                    isDisabled
                      ? 'text-slate-600 cursor-not-allowed opacity-50'
                      : isActive 
                      ? 'bg-gradient-to-r from-indigo-500/20 to-cyan-500/20 text-white' 
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500 to-cyan-400 rounded-r-full"
                      initial={false}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                  <item.icon className={`w-5 h-5 ${isActive ? 'text-indigo-400' : isDisabled ? 'text-slate-600' : 'group-hover:text-indigo-400'} transition-colors`} />
                  <span className="hidden lg:block font-medium">{item.name}</span>
                </Link>
              );
            })}
        </nav>
        <div className="p-4 border-t border-indigo-500/20 space-y-3">
          <div className="glass rounded-xl border border-indigo-500/20 p-3">
            <div className="text-xs uppercase tracking-wide text-slate-400">Player</div>
            <div className="text-sm font-semibold text-white truncate" title={playerName}>{playerName}</div>
            <div className="mt-2 text-xs uppercase tracking-wide text-slate-400">Gold</div>
            <div className="text-sm font-semibold text-amber-300">{playerGold}g</div>
          </div>
          {gameTime && (
            <>
              <div className="hidden lg:block">
                <TimeWidget gameTime={gameTime} />
              </div>
              <div className="lg:hidden">
                <TimeWidget gameTime={gameTime} compact />
              </div>
            </>
          )}
        </div>
        </aside>

      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-16 glass z-50 flex items-center justify-between px-4">
        <Link to={createPageUrl('Home')} className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-white">Wild Reclaim</span>
        </Link>
        <div className="flex items-center gap-2">
          {gameTime && <TimeWidget gameTime={gameTime} compact />}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-400 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden fixed top-16 left-0 right-0 glass z-40 p-4"
          >
            <nav className="space-y-2">
              {navItems.map((item) => {
                const isActive = currentPageName === item.page;
                const isBattlePage = currentPageName === 'Battle';
                const isZoneLocked = inZoneDetail && item.page !== 'StartScreen';
                const isDisabled = (isBattlePage && item.page !== 'Battle') || isZoneLocked;

                return (
                  <Link
                    key={item.page}
                    to={createPageUrl(item.page)}
                    onClick={(e) => {
                      if (isDisabled) {
                        e.preventDefault();
                        alert(isBattlePage
                          ? '⚔️ You cannot leave during an active battle!'
                          : '🌲 You cannot leave the zone while exploring. Return to town or the main menu first.'
                        );
                      } else {
                        setMobileMenuOpen(false);
                      }
                    }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      isDisabled
                        ? 'text-slate-600 cursor-not-allowed opacity-50'
                        : isActive 
                        ? 'bg-gradient-to-r from-indigo-500/20 to-cyan-500/20 text-white' 
                        : 'text-slate-400'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="md:ml-20 lg:ml-64 min-h-screen pt-16 md:pt-0">
        <div className="p-4 md:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}