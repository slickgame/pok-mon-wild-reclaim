import{quests}from'@/data/m1/quests';
export function QuestPanel(){return <section><h2>Opening Quests</h2><ol>{quests.map((q,i)=><li key={q}>{q} — {i===0?'Active':'Locked'}</li>)}</ol></section>}