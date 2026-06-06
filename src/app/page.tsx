"use client";
import { AppShell } from "@/components/layout/AppShell";
import { MainMenu } from "@/components/menu/MainMenu";
import { GameProvider, useGame } from "@/game/GameProvider";

function Screen(){
 const g=useGame();
 if(g.currentScreen==="newGame")return <main><h1>Poképolis</h1><p>Professor Maple gives you Bulbasaur, Charmander, and Squirtle.</p><button onClick={()=>g.setCurrentScreen("baseCamp")}>Travel to Verdant Hollow</button><button onClick={()=>g.setCurrentScreen("mainMenu")}>Main Menu</button></main>;
 if(g.currentScreen==="baseCamp")return <main><h1>Brambleberry Grove</h1><p>Explore, Party, Bag, Rest/Camp, Talk, Quests, Habitat, and Travel are ready as M1.1