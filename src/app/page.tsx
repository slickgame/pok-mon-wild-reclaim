"use client";
import{useState}from"react";
const party=["Bulbasaur - Support/Sustain - Tackle, Vine Whip, Growl, Leech Seed","Charmander - Attacker - Scratch, Ember, Growl, Smokescreen","Squirtle - Tank - Tackle, Water Gun, Tail Whip, Withdraw"];
const wild=["Caterpie","Weedle","Pidgey","Rattata","Oddish","Bellsprout","Paras"];
export default function Home(){const[screen,setScreen]=useState("town");const[panel,setPanel]=useState("Welcome to Pokepolis. Professor Maple assigned Bul