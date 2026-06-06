export type GameScreen =
  | "mainMenu"
  | "continue"
  | "settings"
  | "pokepolis"
  | "verdantHollow"
  | "brambleberryGrove";

export type PokemonRole = "Support" | "Attacker" | "Tank";

export type PartyPokemon = {
  id: string;
  species: string;
  level: number;
  type: string;
  role: PokemonRole;
  hp: number;
  maxHp: number;
  moves: string[];
  talent: string;
  summary: string;
};

export type InventoryItem = {
  id: string;
  name: string;
