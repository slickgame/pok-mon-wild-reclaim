import{openServices}from'@/data/m1/openServices';
import{locks}from'@/data/m1/locks';
export function SettlementPanel(){return <section><h2>Poképolis</h2><p>Safe hub · starter briefing · first travel gate</p><h3>Open Services</h3><p>{openServices.join(' · ')}</p><h3>Locked</h3><p>{locks.join(' · ')}</p></section>}