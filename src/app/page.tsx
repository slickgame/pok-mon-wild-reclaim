"use client";
import{useState}from"react";
const mons=["Bulbasaur - Support","Charmander - Attacker","Squirtle - Tank"],items=["Potion x3","Poke Ball x5","Field Snack x2"],wild=["Caterpie","Weedle","Pidgey","Rattata","Oddish","Bellsprout","Paras"];
export default function Home(){let[x,sx]=useState(""),[p,sp]=useState("party");let body=p=="party"?mons:p=="bag"?items:["Restores