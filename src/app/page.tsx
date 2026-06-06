"use client";

import { AppShell } from "@/components/layout/AppShell";
import { MainMenu } from "@/components/menu/MainMenu";
import { GameProvider, useGame } from "@/game/GameProvider";
import styles from "./page.module.css";

const starterParty = [
  "Bulbasaur — Support/Sustain: Tackle, Vine Whip, Growl, Leech Seed. Talent: Sprout Guard [C].",
  "Charmander — Attacker: Scratch, Ember, Growl, Smokescreen. Talent: Kindled Spirit [C].",
  "Squirtle — Tank: Tackle, Water Gun, Tail Whip, Withdraw. Talent: Shell Poise [C].",
];

const groveButtons = ["