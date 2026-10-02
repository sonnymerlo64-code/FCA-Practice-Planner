'use client';
import {useEffect,useMemo,useState} from 'react';

const TYPES={
 tue:{label:'Tuesday Indoor',location:'Indoor Facility',note:'2 large tunnels + turf area',stations:['Tunnel 1','Tunnel 2','Turf Area']},
 wed:{label:'Wednesday Indoor',location:'Indoor Facility',note:'3 tunnels split in half: front = hitting, back = fielding/pitching',stations:['Tunnel 1 Front – Hitting','Tunnel 1 Back – Fielding/Pitching','Tunnel 2 Front – Hitting','Tunnel 2 Back – Fielding/Pitching','Tunnel 3 Front – Hitting','Tunnel 3 Back – Fielding/Pitching']},
 sun46:{label:'Sunday 4th–6th',location:'Softball Field',note:'No on-field hitting',stations:['Infield','Outfield','Bullpen / Catching','Baserunning / Team Defense']},
 sun78:{label:'Sunday 7th–8th',location:'Upper Baseball Field',note:'No on-field hitting',stations:['Infield','Outfield','Bullpen / Catching','Baserunning / Team Defense']}
};
const START_DRILLS=['Tee Work','Front Toss','Side Toss','Machine Work','Bunting','Load & Timing','Two-Strike Approach','Opposite Field','Ground Ball Fundamentals','Forehand / Backhand','Short Hops','Double Plays','Fly Ball Communication','Drop Steps','Cuts & Relays','Rundowns','Bunt Defense','1st & 3rd Defense','Picks','Pitcher Fielding Practice','Bullpen','Catcher Receiving','Catcher Blocking','Catcher Throwing','Baserunning Leads','Steals / Reads','Turns at First','Home-to-First','Team Defense','Throwing Progression'];
const emptyRound=(stations,i)=>({name:`Round ${i+1}`,minutes:15,assignments:Object.fromEntries(stations.map(s=>[s,'']))});
function timeAdd(t,mins){let [h,m]=t.split(':').map(Number);let x=h*60+m+mins;return `${String(Math.floor(x/60)%24).padStart(2,'0')}:${String(x%60).padStart(2,'0')}`}
export default function Page(){
 const [type,setType]=useState('tue'); const cfg=TYPES[type];
 const [date,setDate]=useState(''); const [start,setStart]=useState('16:30'); const [title,setTitle]=useState('FCA Baseball Practice');
 const [warmup,setWarmup]=useState('Dynamic Warm-Up / Throwing Progression'); const [warmMin,setWarmMin]=useState(15);
 const [rounds,setRounds]=useState(()=>[0,1,2,3].map(i=>emptyRound(TYPES.tue.stations,i)));
 const [drills,setDrills]=useState(START_DRILLS); const [newDrill,setNewDrill]=useState(''); const [notes,setNotes]=useState(''); const [saved,setSaved]=useState([]);
 useEffect(()=>{try{setSaved(JSON.parse(localStorage.getItem('fcaSavedPlans')||'[]'));setDrills(JSON.parse(localStorage.getItem('fcaDrills')||'null')||START_DRILLS)}catch{}},[]);
 useEffect(()=>{localStorage.setItem('fcaDrills',JSON.stringify(drills))},[drills]);
 function changeType(v){setType(v);setRounds([0,1,2,3].map(i=>emptyRound(TYPES[v].stations,i)))}
 function addRound(){setRounds(r=>[...r,emptyRound(cfg.stations,r.length)])}
 function updateRound(i,key,val){setRounds(r=>r.map((x,n)=>n===i?{...x,[key]:val}:x))}
 function assign(i,s,val){setRounds(r=>r.map((x,n)=>n===i?{...x,assignments:{...x.assignments,[s]:val}}:x))}
 function addDrill(){let d=newDrill.trim();if(d&&!drills.includes(d)){setDrills([...drills,d]);setNewDrill('')}}
 function savePlan(){let plan={id:Date.now(),title,date,start,type,warmup,warmMin,rounds,notes};let x=[plan,...saved];setSaved(x);localStorage.setItem('fcaSavedPlans',JSON.stringify(x));alert('Practice saved on this device.')}
 function loadPlan(p){setTitle(p.title);setDate(p.date);setStart(p.start);setType(p.type);setWarmup(p.warmup);setWarmMin(p.warmMin);setRounds(p.rounds);setNotes(p.notes||'')}
 function delPlan(id){let x=saved.filter(p=>p.id!==id);setSaved(x);localStorage.setItem('fcaSavedPlans',JSON.stringify(x))}
 const timeline=useMemo(()=>{let cur=timeAdd(start,Number(warmMin));return rounds.map(r=>{let a=cur;cur=timeAdd(cur,Number(r.minutes));return [a,cur]})},[start,warmMin,rounds]);
 return <main>
  <header><div><div className="eyebrow">FCA BASEBALL SAN DIEGO</div><h1>Practice Planner</h1></div><div className="actions"><button onClick={savePlan}>Save Practice</button><button className="dark" onClick={()=>window.print()}>Print / PDF</button></div></header>
  <section className="card controls"><label>Practice Type<select value={type} onChange={e=>changeType(e.target.value)}>{Object.entries(TYPES).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}</select></label><label>Date<input type="date" value={date} onChange={e=>setDate(e.target.value)}/></label><label>Start Time<input type="time" value={start} onChange={e=>setStart(e.target.value)}/></label><label>Practice Title<input value={title} onChange={e=>setTitle(e.target.value)}/></label></section>
  <section className="facility"><b>{cfg.location}</b><span>{cfg.note}</span></section>
  <section className="card"><h2>Opening Block</h2><div className="row"><input className="grow" value={warmup} onChange={e=>setWarmup(e.target.value)}/><label className="mini">Minutes<input type="number" min="0" value={warmMin} onChange={e=>setWarmMin(e.target.value)}/></label></div></section>
  <section className="card"><div className="sectionHead"><h2>Practice Rounds</h2><button onClick={addRound}>+ Add Round</button></div>{rounds.map((r,i)=><div className="round" key={i}><div className="roundHead"><input value={r.name} onChange={e=>updateRound(i,'name',e.target.value)}/><b>{timeline[i]?.[0]}–{timeline[i]?.[1]}</b><label>Min <input type="number" min="1" value={r.minutes} onChange={e=>updateRound(i,'minutes',e.target.value)}/></label><button className="danger" onClick={()=>setRounds(rounds.filter((_,n)=>n!==i))}>Remove</button></div><div className="stations">{cfg.stations.map(s=><label key={s}><span>{s}</span><select value={r.assignments[s]||''} onChange={e=>assign(i,s,e.target.value)}><option value="">Select drill...</option>{drills.map(d=><option key={d}>{d}</option>)}</select></label>)}</div></div>)}</section>
  <section className="card"><h2>Practice Notes</h2><textarea rows="4" value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Coaching points, devotional, emphasis, equipment, etc."/></section>
  <section className="card noPrint"><h2>Drill Library</h2><div className="row"><input className="grow" placeholder="Add a drill" value={newDrill} onChange={e=>setNewDrill(e.target.value)} onKeyDown={e=>e.key==='Enter'&&addDrill()}/><button onClick={addDrill}>Add</button></div><div className="chips">{drills.map(d=><span key={d}>{d}<button onClick={()=>setDrills(drills.filter(x=>x!==d))}>×</button></span>)}</div></section>
  {saved.length>0&&<section className="card noPrint"><h2>Saved Practices</h2>{saved.map(p=><div className="saved" key={p.id}><div><b>{p.title}</b><small>{TYPES[p.type]?.label} · {p.date||'No date'}</small></div><div><button onClick={()=>loadPlan(p)}>Open</button><button className="danger" onClick={()=>delPlan(p.id)}>Delete</button></div></div>)}</section>}
 </main>
}
