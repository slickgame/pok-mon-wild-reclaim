"use client";
import { AppShell } from "@/components/layout/AppShell";
import { MainMenu } from "@/components/menu/MainMenu";
import { GameProvider, useGame } from "@/game/GameProvider";

const party = [
  { n: "Bulbasaur", r: "Support / Sustain", hp: "45/45", m: "Tackle, Vine Whip, Growl, Leech Seed", t: "Sprout Guard [C]" },
  { n: "Charmander", r: "Attacker / Glass Cannon", hp: "39/39", m: "Scratch,