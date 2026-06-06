export type GameScreen = "mainMenu" | "continue" | "settings" | "pokepolis" | "verdantHollow" | "brambleberryGrove";

export type PartyPokemon = {
  id: string;
  species: string;
  level: number;
  type: string;
  role: "Support" | "Attacker" | "Tank";
  hp: number;
  maxHp: number;
  moves: string[];
  talent: string;
  summary: string;
};

export type InventoryItem = {
  id: string;
  name: string;
  quantity: number;
};

export type GameState = {
  currentScreen: GameScreen;
  selected