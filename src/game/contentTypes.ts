export type PokemonType = "Bug" | "Fire" | "Flying" | "Grass" | "Normal" | "Poison" | "Water";

export type CombatRole =
  | "Attacker"
  | "Glass Cannon"
  | "Hazard Seed"
  | "Scout"
  | "Stabilizer"
  | "Status Specialist"
  | "Support"
  | "Sustain"
  | "Tank";

export type MoveCategory = "Physical" | "Special" | "Status";

export type MoveDefinition = {
  id: string;
  name: string;
  type: PokemonType;
