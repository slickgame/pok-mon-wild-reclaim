"use client";

import { AppShell } from "@/components/layout/AppShell";
import { MainMenu } from "@/components/menu/MainMenu";
import { GameProvider, useGame } from "@/game/GameProvider";
import styles from "./page.module.css";

function PlaceholderScreen() {
  const { currentScreen, setCurrentScreen } = useGame();

  const screenCopy = {
    newGame: {
      eyebrow: "M1 Preview",
      title: "New Game",
      body: "M1 will add player profile creation, local save slots, and the first trip into Base Camp.",
    },
    continue: {
      eyebrow: "M1 Preview",
      title: "Continue",
      body: "M1 will display local save slots here. For M0, the app only keeps placeholder shell state.",
    },
    settings: {
      eyebrow: "Optional Shell",
      title: "Settings",
      body: "Future settings can live here. M0 keeps this as a simple placeholder so the menu flow is testable.",
    },
    baseCamp: {
      eyebrow: "Coming Soon",
      title: "Base Camp",
      body: "M1 will turn this into the first playable destination after creating or loading a save.",
    },
  } as const;

  const copy = screenCopy[currentScreen] ?? screenCopy.newGame;

  return (
    <section className={styles.placeholderPanel} aria-labelledby="placeholder-title">
      <p className={styles.eyebrow}>{copy.eyebrow}</p>
      <h1 id="placeholder-title">{copy.title}</h1>
      <p>{copy.body}</p>
      <button className={styles.backButton} type="button" onClick={() => setCurrentScreen("mainMenu")}>
        Back to Main Menu
      </button>
    </section>
  );
}

function GameScreen() {
  const { currentScreen } = useGame();

  return currentScreen === "mainMenu" ? <MainMenu /> : <PlaceholderScreen />;
}

export default function Home() {
  return (
    <GameProvider>
      <AppShell>
        <GameScreen />
      </AppShell>
    </GameProvider>
  );
}
