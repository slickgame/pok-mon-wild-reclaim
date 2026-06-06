export type PokemonType = "Bug" | "Fire" | "Flying" | "Grass" | "Normal" | "Poison" | "Water";
export type CombatRole = "Attacker" | "Glass Cannon" | "Scout" | "Stabilizer" | "Status Specialist" | "Support" | "Sustain" | "Tank";
export type MoveCategory = "Physical" | "Special" | "Status";
export type MoveDefinition = { id: string; name: string; type: PokemonType; category: MoveCategory; power: number | null; accuracy: number | null; description: string