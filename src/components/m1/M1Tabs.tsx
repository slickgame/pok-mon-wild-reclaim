"use client";
import{useState}from'react';
import{SettlementPanel}from'./SettlementPanel';
import{PartyPanel}from'./PartyPanel';
import{QuestPanel}from'./QuestPanel';
import{BrambleberryPanel}from'./BrambleberryPanel';
import{ExplorePanel}from'./ExplorePanel';
const tabs=['Town','Party','Quests','Grove','Explore']as const;
export function M1Tabs(){const[a,setA]=useState<(typeof tabs)[number]>('Town');return <section><nav style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:12}}>{tabs.map(t=><button key={t} onClick={()=>setA(t)} style={{fontWeight:a===t?700:400}}>{t}</button>)}</nav>{a==='Town'&&<SettlementPanel/>}{a==='Party'&&<PartyPanel/>}{a==='Quests'&&<QuestPanel/>}{a==='Grove'&&<BrambleberryPanel/>}{a==='Explore'&&<ExplorePanel/>}</section>}