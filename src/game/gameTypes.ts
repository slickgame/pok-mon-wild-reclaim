export type GameScreen = "mainMenu" | "newGame" | "continue" | "settings" | "baseCamp";

export type GameState = {
  currentScreen: GameScreen;
  selectedSlotId: string | null;
};
