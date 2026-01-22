import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Search, Filter, Eye, Trophy, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import PageHeader from '@/components/common/PageHeader';
import PokedexCard from '@/components/pokedex/PokedexCard';
import PokedexDetailView from '@/components/pokedex/PokedexDetailView';
import { getAllSpecies } from '@/components/pokedex/pokedexData';

export default function PokedexPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterStage, setFilterStage] = useState('all');
  const [selectedSpecies, setSelectedSpecies] = useState(null);
  const [detailSheetOpen, setDetailSheetOpen] = useState(false);

  // Fetch player's Pokédex entries
  const { data: pokedexEntries = [] } = useQuery({
    queryKey: ['pokedex'],
    queryFn: async () => {
      const entries = await base44.entities.Pokedex.list();
      return entries;
    }
  });

  // Get all possible species
  const allSpecies = getAllSpecies();

  // Combine master data with player progress
  const pokedexData = useMemo(() => {
    return allSpecies.map(speciesData => {
      const entry = pokedexEntries.find(e => e.species === speciesData.species);
      return {
        ...speciesData,
        status: entry?.status || 'Unknown',
        seen: entry?.status === 'Seen' || entry?.status === 'Caught',
        caught: entry?.status === 'Caught',
        caughtCount: entry?.timesCaught || 0,
        firstCaughtLocation: entry?.firstCaughtLocation,
        firstCaughtLevel: entry?.firstCaughtLevel,
        firstCaughtAt: entry?.firstCaughtAt
      };
    });
  }, [pokedexEntries, allSpecies]);

  // Filter and search
  const filteredData = useMemo(() => {
    let filtered = [...pokedexData];

    // Search
    if (searchQuery) {
      filtered = filtered.filter(p => 
        p.species.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.dexNumber.toString().includes(searchQuery)
      );
    }

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(p => p.types.includes(filterType));
    }

    // Filter by role
    if (filterRole !== 'all') {
      filtered = filtered.filter(p => p.role === filterRole);
    }

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(p => {
        if (filterStatus === 'caught') return p.caught;
        if (filterStatus === 'seen') return p.seen && !p.caught;
        if (filterStatus === 'unknown') return !p.seen;
        return true;
      });
    }

    // Filter by evolution stage
    if (filterStage !== 'all') {
      filtered = filtered.filter(p => p.evolutionStage === filterStage);
    }

    return filtered.sort((a, b) => a.dexNumber - b.dexNumber);
  }, [pokedexData, searchQuery, filterType, filterRole, filterStatus, filterStage]);

  // Stats
  const totalSpecies = allSpecies.length;
  const seenCount = pokedexData.filter(p => p.seen).length;
  const caughtCount = pokedexData.filter(p => p.caught).length;

  const handleCardClick = (species) => {
    setSelectedSpecies(species);
    setDetailSheetOpen(true);
  };

  return (
    <div>
      <PageHeader
        title="Pokédex"
        subtitle={`${caughtCount} Caught • ${seenCount} Seen • ${totalSpecies} Total`}
        icon={BookOpen}
      />

      {/* Progress Bar */}
      <div className="glass rounded-xl p-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-slate-300">Pokédex Completion</span>
          <span className="text-sm font-semibold text-indigo-400">
            {Math.round((caughtCount / totalSpecies) * 100)}%
          </span>
        </div>
        <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(caughtCount / totalSpecies) * 100}%` }}
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
          />
        </div>
        <div className="flex gap-4 mt-3 text-xs">
          <div className="flex items-center gap-1">
            <Trophy className="w-4 h-4 text-yellow-400" />
            <span className="text-slate-400">{caughtCount} Caught</span>
          </div>
          <div className="flex items-center gap-1">
            <Eye className="w-4 h-4 text-blue-400" />
            <span className="text-slate-400">{seenCount} Seen</span>
          </div>
          <div className="flex items-center gap-1">
            <HelpCircle className="w-4 h-4 text-slate-500" />
            <span className="text-slate-400">{totalSpecies - seenCount} Unknown</span>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="glass rounded-xl p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search by name or number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-800/50 border-slate-700"
            />
          </div>

          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="bg-slate-800/50 border-slate-700">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="Normal">Normal</SelectItem>
              <SelectItem value="Fire">Fire</SelectItem>
              <SelectItem value="Water">Water</SelectItem>
              <SelectItem value="Grass">Grass</SelectItem>
              <SelectItem value="Electric">Electric</SelectItem>
              <SelectItem value="Bug">Bug</SelectItem>
              <SelectItem value="Poison">Poison</SelectItem>
              <SelectItem value="Flying">Flying</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterRole} onValueChange={setFilterRole}>
            <SelectTrigger className="bg-slate-800/50 border-slate-700">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="Tank">Tank</SelectItem>
              <SelectItem value="Striker">Striker</SelectItem>
              <SelectItem value="Support">Support</SelectItem>
              <SelectItem value="Scout">Scout</SelectItem>
              <SelectItem value="Medic">Medic</SelectItem>
              <SelectItem value="Juggernaut">Juggernaut</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="bg-slate-800/50 border-slate-700">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="caught">Caught</SelectItem>
              <SelectItem value="seen">Seen Only</SelectItem>
              <SelectItem value="unknown">Unknown</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2 mt-3">
          <Button
            size="sm"
            variant={filterStage === 'all' ? 'default' : 'outline'}
            onClick={() => setFilterStage('all')}
            className="text-xs"
          >
            All Stages
          </Button>
          <Button
            size="sm"
            variant={filterStage === 'Basic' ? 'default' : 'outline'}
            onClick={() => setFilterStage('Basic')}
            className="text-xs"
          >
            Basic
          </Button>
          <Button
            size="sm"
            variant={filterStage === 'Stage 1' ? 'default' : 'outline'}
            onClick={() => setFilterStage('Stage 1')}
            className="text-xs"
          >
            Stage 1
          </Button>
          <Button
            size="sm"
            variant={filterStage === 'Final' ? 'default' : 'outline'}
            onClick={() => setFilterStage('Final')}
            className="text-xs"
          >
            Final
          </Button>
        </div>
      </div>

      {/* Pokédex Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        <AnimatePresence mode="popLayout">
          {filteredData.map((species) => (
            <PokedexCard
              key={species.dexNumber}
              species={species}
              onClick={() => handleCardClick(species)}
            />
          ))}
        </AnimatePresence>
      </div>

      {filteredData.length === 0 && (
        <div className="glass rounded-xl p-12 text-center">
          <Filter className="w-16 h-16 mx-auto mb-4 text-slate-600" />
          <h3 className="text-xl font-semibold text-white mb-2">No Results</h3>
          <p className="text-slate-400">Try adjusting your search or filters</p>
        </div>
      )}

      {/* Detail Sheet */}
      <Sheet open={detailSheetOpen} onOpenChange={setDetailSheetOpen}>
        <SheetContent className="glass border-slate-700 overflow-y-auto w-full sm:max-w-xl">
          <SheetHeader>
            <SheetTitle className="text-white">Pokédex Entry</SheetTitle>
          </SheetHeader>
          {selectedSpecies && (
            <PokedexDetailView species={selectedSpecies} />
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}