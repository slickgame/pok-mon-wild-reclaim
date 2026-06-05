"use client";

import { createContext, useContext, useMemo, useState } from "react";
import { defaultSaveSlots } from "@/data/defaultSave";
import type { GameScreen, GameState } from "@/game/gameTypes";
import type { SaveSlot } from "@/game/saveTypes";

type GameContextValue = GameState & {
  saveSlots: SaveSlot[];
  setCurrentScreen: (screen: GameScreen) => void;
  selectSlot: (slotId: string | null) => void;
};

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const [currentScreen, setCurrentScreen] = useState<GameScreen>("mainMenu");
  const [selectedSlotId, selectSlot] = useState<string | null>(null);

  const value = useMemo<GameContextValue>(
    () => ({
      currentScreen,
      selectedSlotId,
      saveSlots: defaultSaveSlots,
      setCurrentScreen,
      selectSlot,
    }),
    [currentScreen, selectedSlotId]
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const context = useContext(GameContext);

  if (!context) {
    throw new Error("useGame must be used inside GameProvider");
  }

  return context;
}
