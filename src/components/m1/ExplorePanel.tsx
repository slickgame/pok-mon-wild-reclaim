"use client";
import{useState}from'react';
import{encounterNames}from'@/data/m1/encounterNames';
export function ExplorePanel(){const[x,setX]=useState('');return <section><h2>Explore</h2><button onClick={()=>setX(encounterNames[Math.random()*encounterNames.length|0])}>Explore Brambleberry Grove</button>{x&&<p>Wild {x} appeared! Observe / Back Away / Start Battle coming next.</p>}</section>}