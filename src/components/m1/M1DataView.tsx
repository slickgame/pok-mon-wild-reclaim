import{SettlementPanel}from'./SettlementPanel';
import{PartyPanel}from'./PartyPanel';
import{QuestPanel}from'./QuestPanel';
import{BrambleberryPanel}from'./BrambleberryPanel';
import{ExplorePanel}from'./ExplorePanel';
export function M1DataView(){return <section style={{display:'grid',gap:16}}><h2>M1 Vertical Slice</h2><SettlementPanel/><PartyPanel/><QuestPanel/><BrambleberryPanel/><ExplorePanel/></section>}