'use client';
import {useEffect,useMemo,useState} from 'react';

const TYPES={
 tue:{label:'Tuesday Indoor',location:'Indoor Facility',note:'2 large tunnels + turf area',stations:['Tunnel 1','Tunnel 2','Turf Area']},
 wed:{label:'Wednesday Indoor',location:'Indoor Facility',note:'3 tunnels split in half: front = hitting, back = fielding/pitching',stations:['Tunnel 1 Front','Tunnel 1 Back','Tunnel 2 Front','Tunnel 2 Back','Tunnel 3 Front','Tunnel 3 Back']},
 sun46:{label:'Sunday 4th–6th',location:'Softball Field',note:'No on-field hitting',stations:['Infield','Outfield','Bullpen / Catching','Baserunning / Team Defense']},
 sun78:{label:'Sunday 7th–8th',location:'Upper Baseball Field',note:'No on-field hitting',stations:['Infield','Outfield','Bullpen / Catching','Baserunning / Team Defense']}
};
const START={
 offense:['Tee Work','Front Toss','Side Toss','Machine Work','Bunting','Load & Timing','Two-Strike Approach','Gap to Gap','Opposite Field','Hit and Run','Situational Hitting','Baserunning Leads','Steals / Reads','Turns at First','Home-to-First'],
 defense:['Throwing Progression','Ground Ball Fundamentals','Forehand / Backhand','Short Hops','Double Plays','Fly Ball Communication','Drop Steps','Cuts & Relays','Rundowns','Bunt Defense','1st & 3rd Defense','Picks','Pitcher Fielding Practice','Bullpen','Catcher Receiving','Catcher Blocking','Catcher Throwing','Team Defense']
};
const GROUPS=['Group 1','Group 2','Group 3','Group 4'];
const TUE_MATRIX=[
 ['Tunnel 1','Tunnel 2','Pitching','Fielding'],
 ['Tunnel 2','Tunnel 1','Fielding','Pitching'],
 ['Pitching','Fielding','Tunnel 1','Tunnel 2'],
 ['Fielding','Pitching','Tunnel 2','Tunnel 1']
];
const WED_MATRIX=[
 ['Tunnel 1 Front','Tunnel 2 Front','Tunnel 1 Back','Tunnel 2 Back'],
 ['Tunnel 2 Front','Tunnel 3 Front','Tunnel 2 Back','Tunnel 3 Back'],
 ['Tunnel 1 Back','Tunnel 2 Back','Tunnel 1 Front','Tunnel 2 Front'],
 ['Tunnel 2 Back','Tunnel 3 Back','Tunnel 2 Front','Tunnel 3 Front']
];
const indoorRotation=(type,i)=>({name:`Rotation ${i+1}`,minutes:20,groupAssignments:Object.fromEntries(GROUPS.map((g,j)=>[g,{station:(type==='tue'?TUE_MATRIX:WED_MATRIX)[i][j],drill:''}]))});
const emptyRotation=(stations,i)=>({name:`Rotation ${i+1}`,minutes:15,assignments:Object.fromEntries(stations.map(s=>[s,'']))});
function timeAdd(t,mins){let [h,m]=t.split(':').map(Number);let x=h*60+m+Number(mins||0);return `${String(Math.floor(x/60)%24).padStart(2,'0')}:${String(x%60).padStart(2,'0')}`}
function pretty(t){if(!t)return'';let [h,m]=t.split(':').map(Number);return `${((h+11)%12)+1}:${String(m).padStart(2,'0')}`}
function datePretty(d){if(!d)return'';let [y,m,day]=d.split('-');return `${Number(m)}/${Number(day)}/${y}`}

export default function Page(){
 const [type,setType]=useState('tue'); const cfg=TYPES[type];
 const [date,setDate]=useState(''); const [start,setStart]=useState('16:30'); const [title,setTitle]=useState('FCA BASEBALL SAN DIEGO');
 const [quote,setQuote]=useState('PREPARE. COMPETE. RESPOND.');
 const [warmup,setWarmup]=useState('Dynamic Warm-Up / Throwing Progression'); const [warmMin,setWarmMin]=useState(15);
 const [rotations,setRotations]=useState(()=>[0,1,2,3].map(i=>indoorRotation('tue',i)));
 const [drills,setDrills]=useState(START); const [newDrill,setNewDrill]=useState(''); const [newCat,setNewCat]=useState('offense'); const [notes,setNotes]=useState(''); const [saved,setSaved]=useState([]);
 useEffect(()=>{try{setSaved(JSON.parse(localStorage.getItem('fcaSavedPlans')||'[]'));setDrills(JSON.parse(localStorage.getItem('fcaDrillsV2')||'null')||START)}catch{}},[]);
 useEffect(()=>{localStorage.setItem('fcaDrillsV2',JSON.stringify(drills))},[drills]);
 function changeType(v){setType(v);setWarmMin(v==='tue'||v==='wed'?0:15);setRotations([0,1,2,3].map(i=>(v==='tue'||v==='wed')?indoorRotation(v,i):emptyRotation(TYPES[v].stations,i)))}
 function addRotation(){if(type==='tue'||type==='wed')return;setRotations(r=>[...r,emptyRotation(cfg.stations,r.length)])}
 function updateRotation(i,key,val){setRotations(r=>r.map((x,n)=>n===i?{...x,[key]:val}:x))}
 function assign(i,s,val){setRotations(r=>r.map((x,n)=>n===i?{...x,assignments:{...x.assignments,[s]:val}}:x))}
 function assignGroupDrill(i,g,val){setRotations(r=>r.map((x,n)=>n===i?{...x,groupAssignments:{...x.groupAssignments,[g]:{...x.groupAssignments[g],drill:val}}}:x))}
 function addDrill(){let d=newDrill.trim();if(d&&!drills[newCat].includes(d)){setDrills({...drills,[newCat]:[...drills[newCat],d]});setNewDrill('')}}
 function removeDrill(cat,d){setDrills({...drills,[cat]:drills[cat].filter(x=>x!==d)})}
 function savePlan(){let plan={id:Date.now(),title,quote,date,start,type,warmup,warmMin,rotations,notes};let x=[plan,...saved];setSaved(x);localStorage.setItem('fcaSavedPlans',JSON.stringify(x));alert('Practice saved on this device.')}
 function loadPlan(p){setTitle(p.title||'FCA BASEBALL SAN DIEGO');setQuote(p.quote||'PREPARE. COMPETE. RESPOND.');setDate(p.date);setStart(p.start);setType(p.type);setWarmup(p.warmup);setWarmMin(p.warmMin);setRotations(p.rotations);setNotes(p.notes||'')}
 function delPlan(id){let x=saved.filter(p=>p.id!==id);setSaved(x);localStorage.setItem('fcaSavedPlans',JSON.stringify(x))}
 const timeline=useMemo(()=>{let cur=timeAdd(start,warmMin);return rotations.map(r=>{let a=cur;cur=timeAdd(cur,r.minutes);return [a,cur]})},[start,warmMin,rotations]);
 const end=timeline.length?timeline[timeline.length-1][1]:timeAdd(start,warmMin);
 const DrillSelect=({value,onChange})=><select value={value||''} onChange={onChange}><option value="">Select drill...</option><optgroup label="OFFENSE">{drills.offense.map(d=><option key={'o'+d} value={d}>{d}</option>)}</optgroup><optgroup label="DEFENSE">{drills.defense.map(d=><option key={'d'+d} value={d}>{d}</option>)}</optgroup></select>;
 return <main>
  <div className="screenApp">
   <header><div><div className="eyebrow">FCA BASEBALL SAN DIEGO</div><h1>Practice Planner</h1></div><div className="actions"><button onClick={savePlan}>Save Practice</button><button className="dark" onClick={()=>window.print()}>Print / PDF</button></div></header>
   <section className="card controls"><label>Practice Type<select value={type} onChange={e=>changeType(e.target.value)}>{Object.entries(TYPES).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}</select></label><label>Date<input type="date" value={date} onChange={e=>setDate(e.target.value)}/></label><label>Start Time<input type="time" value={start} onChange={e=>setStart(e.target.value)}/></label><label>Practice Heading<input value={title} onChange={e=>setTitle(e.target.value)}/></label><label className="quoteControl">Practice Quote / Theme<input value={quote} onChange={e=>setQuote(e.target.value)}/></label></section>
   <section className="facility"><b>{cfg.location}</b><span>{cfg.note}</span></section>
   <section className="card"><h2>Opening Block</h2><div className="row"><input className="grow" value={warmup} onChange={e=>setWarmup(e.target.value)}/><label className="mini">Minutes<input type="number" min="0" value={warmMin} onChange={e=>setWarmMin(e.target.value)}/></label></div></section>
   <section className="card"><div className="sectionHead"><h2>Practice Rotations</h2>{!(type==='tue'||type==='wed')&&<button onClick={addRotation}>+ Add Rotation</button>}</div>
    {(type==='tue'||type==='wed')&&<div className="indoorSummary"><b>4 Groups · 80 Minutes Total · 20-Minute Rotations</b><span>Groups 1 & 2 start hitting. Groups 3 & 4 start defense. Groups swap sides at the 40-minute mark.</span></div>}
    {rotations.map((r,i)=><div className="rotation" key={i}><div className="rotationHead"><input value={r.name} onChange={e=>updateRotation(i,'name',e.target.value)}/><b>{pretty(timeline[i]?.[0])}–{pretty(timeline[i]?.[1])}</b>{!(type==='tue'||type==='wed')&&<><label>Min <input type="number" min="1" value={r.minutes} onChange={e=>updateRotation(i,'minutes',e.target.value)}/></label><button className="danger" onClick={()=>setRotations(rotations.filter((_,n)=>n!==i))}>Remove</button></>}</div>
     {(type==='tue'||type==='wed')?<div className="groupGrid">{GROUPS.map(g=>{let a=r.groupAssignments?.[g]||{};let offense=(a.station||'').includes('Front')||(a.station||'').includes('Tunnel')&&!((a.station||'').includes('Back'));return <label key={g}><span><b>{g}</b><small>{a.station}</small></span><select value={a.drill||''} onChange={e=>assignGroupDrill(i,g,e.target.value)}><option value="">Select drill...</option><optgroup label={offense?'OFFENSE':'DEFENSE'}>{(offense?drills.offense:drills.defense).map(d=><option key={d} value={d}>{d}</option>)}</optgroup></select></label>})}</div>:<div className="stations">{cfg.stations.map(s=><label key={s}><span>{s}</span><DrillSelect value={r.assignments[s]} onChange={e=>assign(i,s,e.target.value)}/></label>)}</div>}
    </div>)}</section>
   <section className="card"><h2>Practice Notes</h2><textarea rows="4" value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Coaching points, devotional, emphasis, equipment, etc."/></section>
   <section className="card"><h2>Drill Library</h2><div className="row"><select className="catSelect" value={newCat} onChange={e=>setNewCat(e.target.value)}><option value="offense">OFFENSE</option><option value="defense">DEFENSE</option></select><input className="grow" placeholder="Add a drill" value={newDrill} onChange={e=>setNewDrill(e.target.value)} onKeyDown={e=>e.key==='Enter'&&addDrill()}/><button onClick={addDrill}>Add</button></div><div className="libraryCols"><div><h3>OFFENSE</h3><div className="chips">{drills.offense.map(d=><span key={d}>{d}<button onClick={()=>removeDrill('offense',d)}>×</button></span>)}</div></div><div><h3>DEFENSE</h3><div className="chips">{drills.defense.map(d=><span key={d}>{d}<button onClick={()=>removeDrill('defense',d)}>×</button></span>)}</div></div></div></section>
   {saved.length>0&&<section className="card"><h2>Saved Practices</h2>{saved.map(p=><div className="saved" key={p.id}><div><b>{p.title}</b><small>{TYPES[p.type]?.label} · {p.date||'No date'}</small></div><div><button onClick={()=>loadPlan(p)}>Open</button><button className="danger" onClick={()=>delPlan(p.id)}>Delete</button></div></div>)}</section>}
  </div>

  <article className="printSheet">
   <div className="printTop"><b>Date: {datePretty(date)}</b><div className="fcaMark">FCA</div></div>
   <div className="printHeading">{title}</div>
   <div className="printQuote">{quote}</div>
   <div className="openingLine"><b>{pretty(start)}–{pretty(timeAdd(start,warmMin))}</b><span>{warmup}</span></div>
   <div className="printSectionTitle">{cfg.label.toUpperCase()} ROTATIONS — {type==='tue'||type==='wed'?'20 MINUTES EACH':(rotations.length?`${rotations[0].minutes} MINUTES EACH`:'')}</div>
   {(type==='tue'||type==='wed')?<>
    <table className="rotationTable groupPrint"><thead><tr><th>TIME</th>{GROUPS.map(g=><th key={g}>{g.toUpperCase()}</th>)}</tr></thead><tbody>{rotations.map((r,i)=><tr key={i}><td>{pretty(timeline[i]?.[0])}–{pretty(timeline[i]?.[1])}</td>{GROUPS.map(g=>{let a=r.groupAssignments?.[g]||{};return <td key={g}><b>{a.station}</b><br/>{a.drill||'—'}</td>})}</tr>)}</tbody></table>
    <div className="halfway">40-MINUTE HALFWAY SWAP — GROUPS 1 & 2 ↔ GROUPS 3 & 4</div>
   </>:<table className="rotationTable"><thead><tr><th>TIME</th>{cfg.stations.map(s=><th key={s}>{s.toUpperCase()}</th>)}</tr></thead><tbody>{rotations.map((r,i)=><tr key={i}><td>{pretty(timeline[i]?.[0])}–{pretty(timeline[i]?.[1])}</td>{cfg.stations.map(s=><td key={s}>{r.assignments[s]||'—'}</td>)}</tr>)}</tbody></table>}
   <div className="printSectionTitle drillTitle">DRILL DETAILS</div>
   <table className="detailTable"><thead><tr><th>ROTATION</th><th>TIME</th><th>GROUP / LOCATION / DRILL</th></tr></thead><tbody>{rotations.map((r,i)=>(type==='tue'||type==='wed')?GROUPS.map((g,j)=>{let a=r.groupAssignments?.[g]||{};return <tr key={i+'-'+g}>{j===0&&<td rowSpan={4}>{r.name}</td>}{j===0&&<td rowSpan={4}>{pretty(timeline[i]?.[0])}–{pretty(timeline[i]?.[1])}</td>}<td><b>{g} — {a.station}:</b> {a.drill||'—'}</td></tr>}):cfg.stations.map((st,j)=><tr key={i+'-'+j}>{j===0&&<td rowSpan={cfg.stations.length}>{r.name}</td>}{j===0&&<td rowSpan={cfg.stations.length}>{pretty(timeline[i]?.[0])}–{pretty(timeline[i]?.[1])}</td>}<td><b>{st}:</b> {r.assignments[st]||'—'}</td></tr>))}</tbody></table>
   {notes&&<><div className="printSectionTitle drillTitle">PRACTICE NOTES</div><div className="printNotes">{notes}</div></>}
   <div className="printFooter">{pretty(end)} &nbsp; BREAKDOWN / RELEASE</div>
  </article>
 </main>
}
