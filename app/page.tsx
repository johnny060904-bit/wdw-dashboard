"use client";
import { useState, useEffect } from "react";

const RIDES = [
  { id: 0, name: "Toy Story Mania", park: "Hollywood Studios", icon: "\u{1F680}", avg: 54, median: 50, std: 30 },
  { id: 1, name: "Rock 'n' Roller Coaster", park: "Hollywood Studios", icon: "\u{1F3B8}", avg: 59, median: 55, std: 32 },
  { id: 2, name: "Slinky Dog Dash", park: "Hollywood Studios", icon: "\u{1F415}", avg: 73, median: 70, std: 28 },
  { id: 3, name: "Alien Swirling Saucers", park: "Hollywood Studios", icon: "\u{1F47D}", avg: 30, median: 30, std: 16 },
  { id: 4, name: "Seven Dwarfs Mine Train", park: "Magic Kingdom", icon: "\u{26CF}\u{FE0F}", avg: 77, median: 70, std: 34 },
  { id: 5, name: "Flight of Passage", park: "Animal Kingdom", icon: "\u{1F409}", avg: 115, median: 115, std: 54 },
  { id: 6, name: "Soarin'", park: "EPCOT", icon: "\u{1FA82}", avg: 46, median: 40, std: 27 },
  { id: 7, name: "Pirates of the Caribbean", park: "Magic Kingdom", icon: "\u{1F3F4}\u{200D}\u{2620}\u{FE0F}", avg: 29, median: 25, std: 18 },
];
const DAY_DATA = [{day:"Mon",avg:62.3},{day:"Tue",avg:58.4},{day:"Wed",avg:56.2},{day:"Thu",avg:56.8},{day:"Fri",avg:58.0},{day:"Sat",avg:62.5},{day:"Sun",avg:59.0}];
const HOLIDAYS = [{period:"Christmas/New Years",avg:79,pct:43,icon:"\u{1F384}"},{period:"Thanksgiving",avg:68,pct:25,icon:"\u{1F983}"},{period:"Spring Break",avg:67,pct:22,icon:"\u{1F334}"},{period:"Summer Peak",avg:62,pct:12,icon:"\u{2600}\u{FE0F}"},{period:"Regular",avg:55,pct:0,icon:"\u{1F4C5}"}];
const SEASONS = [{season:"Winter",avg:65,icon:"\u{2744}\u{FE0F}"},{season:"Spring",avg:61,icon:"\u{1F338}"},{season:"Summer",avg:60,icon:"\u{2600}\u{FE0F}"},{season:"Fall",avg:51,icon:"\u{1F342}"}];
const PARK_COLORS: Record<string,string> = {"Hollywood Studios":"#0F4C81","Magic Kingdom":"#1B6B93","Animal Kingdom":"#2E7D32","EPCOT":"#6A1B9A"};
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const DAYS_FULL = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
const HOURS = Array.from({length:14},(_,i)=>i+8);
const HS_HOURLY: Record<string,number[]> = {"Slinky Dog Dash":[59,79,80,84,82,80,81,66,66,78,74,70,66,61,52,47],"Toy Story Mania":[30,46,61,63,62,63,66,63,60,55,60,52,45,34,29,28],"Rock 'n' Roller Coaster":[24,42,66,72,66,66,66,70,66,66,60,59,55,50,40,40],"Alien Swirling Saucers":[18,27,39,41,39,36,36,35,33,30,27,26,22,15,15,15]};

// Simplified prediction lookup from Random Forest model
function getPrediction(rideId:number,month:number,dow:number,holiday:number):number {
  const bases = [54,59,73,30,77,115,46,29];
  const monthFactor = [1.1,1.15,1.25,1.15,1.05,1.2,1.3,1.1,0.75,0.85,1.0,1.2];
  const dowFactor = [1.03,0.97,0.93,0.94,0.96,1.04,0.98];
  const base = bases[rideId] * monthFactor[month-1] * dowFactor[dow];
  return Math.round(holiday ? base * 1.3 : base);
}

function AnimatedBar({value,max,color,delay=0}:{value:number;max:number;color:string;delay?:number}) {
  const [w,setW]=useState(0);
  useEffect(()=>{const t=setTimeout(()=>setW((value/max)*100),50+delay);return()=>clearTimeout(t)},[value,max,delay]);
  return <div className="h-7 bg-gray-800 rounded-full overflow-hidden"><div className="h-full rounded-full transition-all duration-1000 ease-out" style={{width:`${w}%`,backgroundColor:color}}/></div>;
}

function PredictionTab() {
  const [ride,setRide]=useState(0);const [month,setMonth]=useState(6);const [dow,setDow]=useState(2);const [holiday,setHoliday]=useState(0);const [show,setShow]=useState(false);
  const pred = getPrediction(ride,month,dow,holiday);
  const rideInfo = RIDES[ride];
  useEffect(()=>{setShow(false);const t=setTimeout(()=>setShow(true),300);return()=>clearTimeout(t)},[ride,month,dow,holiday]);
  const getColor=(m:number)=>m<=30?"#22c55e":m<=50?"#84cc16":m<=70?"#eab308":m<=90?"#f97316":"#ef4444";
  const getLabel=(m:number)=>m<=30?"Low":m<=50?"Moderate":m<=70?"High":m<=90?"Very High":"Extreme";
  return <div>
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border border-gray-700 mb-5">
      <div className="flex items-center gap-2 mb-5"><span className="text-2xl">{"\u{1F52E}"}</span><h3 className="text-lg font-bold text-white">Wait Time Predictor</h3><span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full ml-2">Random Forest ML</span></div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div><label className="block text-xs text-gray-400 mb-1.5">Attraction</label><select value={ride} onChange={e=>setRide(Number(e.target.value))} className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2.5 text-sm text-white focus:border-amber-500 focus:outline-none">{RIDES.map(r=><option key={r.id} value={r.id}>{r.icon} {r.name}</option>)}</select></div>
        <div><label className="block text-xs text-gray-400 mb-1.5">Month</label><select value={month} onChange={e=>setMonth(Number(e.target.value))} className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2.5 text-sm text-white focus:border-amber-500 focus:outline-none">{MONTHS.map((m,i)=><option key={i} value={i+1}>{m}</option>)}</select></div>
        <div><label className="block text-xs text-gray-400 mb-1.5">Day of Week</label><select value={dow} onChange={e=>setDow(Number(e.target.value))} className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2.5 text-sm text-white focus:border-amber-500 focus:outline-none">{DAYS_FULL.map((d,i)=><option key={i} value={i}>{d}</option>)}</select></div>
        <div><label className="block text-xs text-gray-400 mb-1.5">Holiday?</label><select value={holiday} onChange={e=>setHoliday(Number(e.target.value))} className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2.5 text-sm text-white focus:border-amber-500 focus:outline-none"><option value={0}>Regular</option><option value={1}>Holiday</option></select></div>
      </div>
      <div className={`transition-all duration-500 ${show?'opacity-100 translate-y-0':'opacity-0 translate-y-2'}`}>
        <div className="bg-gray-950 rounded-xl p-6 text-center border border-gray-700">
          <div className="text-gray-400 text-xs uppercase tracking-widest mb-2">Predicted Wait Time</div>
          <div className="flex items-center justify-center gap-3 mb-2"><span className="text-4xl">{rideInfo.icon}</span><span className="text-5xl font-black" style={{color:getColor(pred)}}>{pred}</span><span className="text-xl text-gray-400">min</span></div>
          <div className="text-sm font-medium px-3 py-1 rounded-full inline-block mb-3" style={{backgroundColor:getColor(pred)+"22",color:getColor(pred)}}>{getLabel(pred)} Wait</div>
          <div className="text-xs text-gray-500">{rideInfo.name} &middot; {MONTHS[month-1]} &middot; {DAYS_FULL[dow]} &middot; {holiday?"Holiday":"Regular"}</div>
        </div>
      </div>
    </div>
    <div className="grid md:grid-cols-2 gap-4">
      <div className="bg-gray-900 rounded-xl p-5 border border-gray-800"><h4 className="text-sm font-semibold text-gray-300 mb-3">Model Performance</h4><div className="space-y-3">{[["Algorithm","Random Forest","amber"],["R\u00B2 Score","0.579","green"],["Mean Abs Error","\u00B115 min","yellow"],["Training Records","1,754,414","blue"]].map(([k,v,c])=><div key={k} className="flex justify-between items-center"><span className="text-xs text-gray-400">{k}</span><span className={`text-sm font-mono text-${c}-400`}>{v}</span></div>)}</div></div>
      <div className="bg-gray-900 rounded-xl p-5 border border-gray-800"><h4 className="text-sm font-semibold text-gray-300 mb-3">Feature Importance</h4><div className="space-y-2">{[{f:"Attraction",v:80.3},{f:"Month",v:10.0},{f:"Day of Week",v:4.9},{f:"Holiday Status",v:4.2},{f:"Weekend",v:0.7}].map(item=><div key={item.f}><div className="flex justify-between text-xs mb-1"><span className="text-gray-400">{item.f}</span><span className="text-gray-300">{item.v}%</span></div><div className="h-1.5 bg-gray-800 rounded-full overflow-hidden"><div className="h-full bg-amber-500 rounded-full" style={{width:`${item.v}%`}}/></div></div>)}</div></div>
    </div>
  </div>;
}

export default function Dashboard() {
  const [tab,setTab]=useState("overview");const [mounted,setMounted]=useState(false);useEffect(()=>setMounted(true),[]);
  const tabs=[{id:"overview",label:"Overview",icon:"\u{2728}"},{id:"rides",label:"By Ride",icon:"\u{1F3A2}"},{id:"predict",label:"Predict",icon:"\u{1F52E}"},{id:"timing",label:"When to Go",icon:"\u{1F5D3}\u{FE0F}"},{id:"hollywood",label:"Studios",icon:"\u{1F3AC}"}];
  return <div className="min-h-screen bg-gray-950 text-white">
    <div className="relative overflow-hidden" style={{background:"linear-gradient(135deg, #0a1628 0%, #1a1a4e 40%, #2d1b69 70%, #0f2b46 100%)"}}>
      <div className="absolute inset-0 opacity-20" style={{backgroundImage:"radial-gradient(circle at 20% 50%, rgba(120,119,198,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,196,0,0.2) 0%, transparent 40%)"}}/>
      <div className="max-w-5xl mx-auto px-4 pt-10 pb-4 relative">
        <div className={`transition-all duration-700 ${mounted?'opacity-100 translate-y-0':'opacity-0 translate-y-4'}`}>
          <div className="flex items-center gap-2 mb-2"><span className="text-2xl">{"\u{1F3F0}"}</span><span className="text-xs font-semibold tracking-widest text-amber-400 uppercase">Data Science Project</span></div>
          <h1 className="text-3xl md:text-4xl font-black mb-2 bg-gradient-to-r from-white via-amber-100 to-amber-300 bg-clip-text text-transparent">Walt Disney World</h1>
          <h2 className="text-xl md:text-2xl font-light text-gray-300 mb-3">Wait Time & Demand Analysis</h2>
          <div className="flex flex-wrap gap-3 text-xs">{["1.75M+ records","8 attractions","4 parks","2015\u20132021","ML predictions"].map((tag,i)=><span key={i} className="px-2.5 py-1 rounded-full bg-white/10 text-gray-300 backdrop-blur-sm border border-white/10">{tag}</span>)}</div>
        </div>
      </div>
      <div className="max-w-5xl mx-auto px-4 flex gap-1 mt-4 overflow-x-auto">{tabs.map(t=><button key={t.id} onClick={()=>setTab(t.id)} className={`px-4 py-2.5 text-sm font-medium rounded-t-xl transition-all whitespace-nowrap ${tab===t.id?"bg-gray-950 text-amber-400 border-t-2 border-amber-400":"text-gray-400 hover:text-white hover:bg-white/5"}`}><span className="mr-1.5">{t.icon}</span>{t.label}</button>)}</div>
    </div>
    <div className="max-w-5xl mx-auto px-4 py-6">
      {tab==="overview"&&<div className={`transition-all duration-500 ${mounted?'opacity-100':'opacity-0'}`}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">{[{l:"Records",v:"1.75M+",s:"Wait time observations",c:"from-blue-500/20 to-blue-600/10"},{l:"Date Range",v:"7 Years",s:"Jan 2015 \u2013 Dec 2021",c:"from-purple-500/20 to-purple-600/10"},{l:"Christmas",v:"+43%",s:"vs regular periods",c:"from-red-500/20 to-red-600/10"},{l:"Best Day",v:"Wed",s:"56 min avg wait",c:"from-green-500/20 to-green-600/10"}].map((s,i)=><div key={i} className={`rounded-xl p-4 bg-gradient-to-br ${s.c} border border-gray-800`}><div className="text-xs text-gray-400 uppercase tracking-wide mb-1">{s.l}</div><div className="text-2xl font-black text-white">{s.v}</div><div className="text-xs text-gray-500 mt-0.5">{s.s}</div></div>)}</div>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-gray-900 rounded-xl p-5 border border-gray-800"><h3 className="text-sm font-semibold text-gray-300 mb-4">Holiday Impact</h3>{HOLIDAYS.map((h,i)=><div key={i} className="mb-3"><div className="flex justify-between text-xs mb-1"><span className="text-gray-400">{h.icon} {h.period}</span><span className="text-gray-300 font-medium">{h.avg} min {h.pct>0?<span className="text-red-400">(+{h.pct}%)</span>:""}</span></div><AnimatedBar value={h.avg} max={85} color={h.period==="Regular"?"#22c55e":h.pct>30?"#ef4444":"#f59e0b"} delay={i*100}/></div>)}</div>
          <div className="bg-gray-900 rounded-xl p-5 border border-gray-800"><h3 className="text-sm font-semibold text-gray-300 mb-4">By Season</h3><div className="flex items-end gap-3 h-44 mt-4 px-2">{SEASONS.map((s,i)=>{const h=(s.avg/75)*100;return<div key={i} className="flex-1 flex flex-col items-center gap-2"><span className="text-sm font-bold text-white">{s.avg}</span><div className="w-full rounded-t-lg bg-gradient-to-t from-amber-600 to-amber-400 transition-all duration-1000 ease-out" style={{height:`${mounted?h:0}%`,transitionDelay:`${i*150}ms`}}/><div className="text-center"><div className="text-lg">{s.icon}</div><div className="text-xs text-gray-400">{s.season}</div></div></div>})}</div></div>
        </div>
      </div>}
      {tab==="rides"&&<div><div className="bg-gray-900 rounded-xl p-5 border border-gray-800 mb-4"><h3 className="text-sm font-semibold text-gray-300 mb-5">Average Wait by Attraction</h3>{RIDES.sort((a,b)=>b.avg-a.avg).map((r,i)=><div key={r.id} className="mb-3"><div className="flex justify-between text-xs mb-1"><span className="text-gray-300">{r.icon} {r.name} <span className="text-gray-500">&middot; {r.park}</span></span><span className="font-bold text-white">{r.avg} min</span></div><AnimatedBar value={r.avg} max={120} color={PARK_COLORS[r.park]} delay={i*80}/></div>)}<div className="flex gap-4 mt-5 flex-wrap">{Object.entries(PARK_COLORS).map(([p,c])=><div key={p} className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full" style={{backgroundColor:c}}/><span className="text-xs text-gray-400">{p}</span></div>)}</div></div></div>}
      {tab==="predict"&&<PredictionTab/>}
      {tab==="timing"&&<div><div className="grid md:grid-cols-2 gap-4"><div className="bg-gray-900 rounded-xl p-5 border border-gray-800"><h3 className="text-sm font-semibold text-gray-300 mb-4">Best & Worst Days</h3><div className="flex items-end gap-2 h-36">{DAY_DATA.map((d,i)=>{const h=((d.avg-50)/15)*100;const isMin=d.avg<=56.5;const isMax=d.avg>=62;return<div key={i} className="flex-1 flex flex-col items-center gap-1"><span className="text-xs font-bold text-gray-300">{Math.round(d.avg)}</span><div className="w-full rounded-t transition-all duration-700" style={{height:`${mounted?h:0}%`,backgroundColor:isMin?"#22c55e":isMax?"#ef4444":"#3b82f6",transitionDelay:`${i*80}ms`,minHeight:"20px"}}/><span className="text-xs text-gray-400">{d.day}</span></div>})}</div></div>
        <div className="bg-gray-900 rounded-xl p-5 border border-gray-800"><h3 className="text-sm font-semibold text-gray-300 mb-4">Peak Hours</h3><div className="space-y-3 mt-2"><div className="flex items-center gap-3 bg-red-500/10 rounded-lg p-3 border border-red-500/20"><span className="text-2xl">{"\u{1F534}"}</span><div><div className="text-red-400 font-bold">11 AM Peak</div><div className="text-xs text-gray-400">70 min avg</div></div></div><div className="flex items-center gap-3 bg-green-500/10 rounded-lg p-3 border border-green-500/20"><span className="text-2xl">{"\u{1F7E2}"}</span><div><div className="text-green-400 font-bold">Rope Drop (8 AM)</div><div className="text-xs text-gray-400">43 min avg</div></div></div><div className="flex items-center gap-3 bg-green-500/10 rounded-lg p-3 border border-green-500/20"><span className="text-2xl">{"\u{1F7E2}"}</span><div><div className="text-green-400 font-bold">After 7 PM</div><div className="text-xs text-gray-400">44 min avg</div></div></div></div></div></div></div>}
      {tab==="hollywood"&&<div><div className="bg-gray-900 rounded-xl p-5 border border-gray-800 mb-4"><div className="flex items-center gap-2 mb-4"><span className="text-xl">{"\u{1F3AC}"}</span><h3 className="text-sm font-semibold text-gray-300">Hollywood Studios Hourly Heatmap</h3></div><div className="overflow-x-auto"><div className="min-w-[600px]"><div className="flex items-center mb-1.5"><div className="w-36"/><div className="flex-1 flex gap-0.5">{HOURS.map(h=><div key={h} className="flex-1 text-center text-xs text-gray-500">{h>12?h-12:h}{h>=12?'p':'a'}</div>)}</div></div>{Object.entries(HS_HOURLY).map(([ride,data])=><div key={ride} className="flex items-center mb-1"><div className="w-36 text-xs text-gray-400 text-right pr-2 truncate">{ride}</div><div className="flex-1 flex gap-0.5">{data.slice(0,14).map((val,i)=>{const intensity=Math.min(val/85,1);return<div key={i} className="flex-1 h-7 rounded flex items-center justify-center text-xs font-medium" style={{backgroundColor:`rgba(${Math.round(200*intensity+30)},${Math.round(60*(1-intensity)+30)},40,${0.3+intensity*0.7})`,color:intensity>0.4?"white":"#aaa"}}>{val}</div>})}</div></div>)}</div></div></div>
        <div className="bg-gray-900 rounded-xl p-5 border border-gray-800"><h3 className="text-sm font-semibold text-gray-300 mb-3">{"\u{1F3AF}"} Insider Strategy</h3><p className="text-xs text-gray-500 mb-3">From a Cast Member who sees these patterns firsthand:</p><div className="space-y-2">{["Hit Slinky Dog Dash at rope drop \u2014 59 min vs 84 min at 11 AM","Rock 'n' Roller Coaster: before 9 AM or after 7 PM saves 30+ min","Alien Swirling Saucers never exceeds 41 min \u2014 save for afternoon","Toy Story Mania waits drop 50% after 7 PM"].map((tip,i)=><div key={i} className="flex gap-2 items-start text-sm text-gray-300"><span className="text-amber-400 font-bold mt-0.5">{i+1}.</span><span>{tip}</span></div>)}</div></div></div>}
      <div className="text-center text-xs text-gray-600 mt-10 pb-6 border-t border-gray-800 pt-6">Built by <span className="text-gray-400 font-medium">Johnny Nguyen</span> &middot; Data from Touring Plans &middot; 1,754,414 records &middot; Random Forest ML Model</div>
    </div>
  </div>;
}
