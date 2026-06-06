"use client";
import { AppShell } from "@/components/layout/AppShell";
import { MainMenu } from "@/components/menu/MainMenu";
import { GameProvider } from "@/game/GameProvider";
export default function Home(){return <GameProvider><AppShell><MainMenu /></AppShell></GameProvider>;}
