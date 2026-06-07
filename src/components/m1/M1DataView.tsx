import{party}from'@/data/m1/party';
import{openServices}from'@/data/m1/openServices';
import{locks}from'@/data/m1/locks';
import{ExplorePanel}from'./ExplorePanel';
export function M1DataView(){return <section><h2>M1 Data Loaded</h2><p>Party: {party.map(p=>p.name).join(', ')}</p><p>Services: {openServices.join(', ')}</p><p>Locked: {locks.join(', ')}</p><ExplorePanel/></section>}