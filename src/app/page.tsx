"use client";
import { useState } from "react";

export default function Home() {
  const [screen, setScreen] = useState("menu");
  const [encounter, setEncounter] = useState("");
  const encounters = ["Caterpie", "Weedle", "Pidgey", "Rattata", "Oddish", "Bellsprout", "Paras"];

  if (screen === "menu") {
    return <main><h1>Pokemon Wild Reclaim</h1><button onClick={() => setScreen("town")}>New Game</button></main>;
  }

  if (screen === "town") {