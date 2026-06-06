"use client";
import{useState}from"react";
export default function Home(){let e=["Caterpie","Weedle","Paras"],[x,s]=useState("");return <main><h1>Wild Reclaim</h1><p>Party: Bulbasaur, Charmander, Squirtle</p><button onClick={()=>s(e[Math.random()*3|0])}>Explore</button>{x&&<h2>Wild {x} appeared!</h2>}</main>}