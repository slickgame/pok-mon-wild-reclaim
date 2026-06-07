import{openServices}from'@/data/m1/openServices';
import{locks}from'@/data/m1/locks';
export function SettlementPanel(){return <section><h2>Poképolis</h2><p>Frontier settlement and safe hub.</p><p>Open: {openServices.join(', ')}</p><p>Locked: {locks.join(', ')}</p></section>}