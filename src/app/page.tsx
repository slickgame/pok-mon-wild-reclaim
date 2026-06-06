"use client";

import { AppShell } from "@/components/layout/AppShell";
import { MainMenu } from "@/components/menu/MainMenu";
import { GameProvider, useGame } from "@/game/GameProvider";
import styles from "./page.module.css";

function M1Shell() {
  const { currentScreen, setCurrentScreen } = useGame();
  if (currentScreen === "mainMenu") return <MainMenu />;
  if (currentScreen === "baseCamp") {
    return <section className={styles.placeholderPanel}><