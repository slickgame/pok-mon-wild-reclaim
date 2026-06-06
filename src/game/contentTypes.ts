export type PokemonType = "Bug" | "Fire" | "Flying" | "Grass" | "Normal" | "Poison" | "Water";

export type MoveCategory = "Physical" | "Special" | "Status";

export type MoveDefinition = {
  id: string;
  name: string;
  type: PokemonType;
  category: MoveCategory;
};
