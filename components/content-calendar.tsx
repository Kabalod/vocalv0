"use client";

import { useMemo, useState } from "react";
import { CalendarDays, Camera, ChevronLeft, ChevronRight, Clapperboard, GalleryHorizontal, LayoutGrid, Plus, Search, Settings2, UserRound } from "lucide-react";
import EventsDiary from "./events-diary";
import "./content-calendar.css";

type Layer = "План" | "События" | "Всё";
type View = "week" | "month";
type Item = { title:string; format:"рилс"|"карусель"; status:"в работе"|"готово"; time:string; date:string };
const publications:Item[]=[
 {title:"Почему я ушёл из найма",format:"карусель",status:"в работе",time:"11:30",date:"2026-10-14"},
 {title:"Привычка и мотивация",format:"рилс",status:"готово",time:"18:00",date:"2026-10-16"},
];
const undated=["Утро без телефона","Три ошибки новичка в зале"];
const eventImages:Record<string,string[]>={"2026-10-06":["/events/evening.png"],"2026-10-09":["/events/gym-road.png"],"2026-10-14":["/events/coffee.png","/events/gym-road.png","/events/evening.png"]};
const start=new Date(2026,9,12);
const week=Array.from({length:7},(_,i)=>{const date=new Date(start);date.setDate(start.getDate()+i);return date});
const month=Array.from({length:35},(_,i)=>{const n=i-2;return n>=1&&n<=31?new Date(2026,9,n):null});
const weekDay=(date:Date,long=false)=>new Intl.DateTimeFormat("ru-RU",{weekday:long?"long":"short"}).format(date).replace(".","");
const iso=(date:Date)=>`2026-10-${String(date.getDate()).padStart(2,"0")}`;
function Format({format}:{format:Item["format"]}){return format==="рилс"?<Clapperboard/>:<GalleryHorizontal/>}
function Publication({item}:{item:Item}){return <button className="cc-publication"><time>{item.time}</time><strong>{item.title}</strong><span><Format format={item.format}/>{item.format}<i className={`dot ${item.status.replace(" ","-")}`}/>{item.status}</span></button>}

export default function ContentCalendar({onThoughts,onProfile,onNew}:{onThoughts:()=>void;onProfile:()=>void;onNew:()=>void}){
 const [layer,setLayer]=useState<Layer>("План");
 const [view,setView]=useState<View>("week");
 const [demoOpen,setDemoOpen]=useState(false);
 if(layer==="События") return <EventsDiary onThoughts={onThoughts} onProfile={onProfile} onNew={onNew} onLayer={setLayer}/>;
 return <div className="content-calendar">
  <header className="cc-global"><b>Vocal</b><nav><button onClick={onThoughts}>Мысли</button><button className="active">Календарь</button><button onClick={onProfile}>Профиль</button></nav></header>
  <main className="cc-main">
   <header className="cc-sticky"><div className="cc-title-row"><h1>Календарь</h1><div><button aria-label="Поиск"><Search/></button><button className="cc-undated">Без даты <b>2</b></button></div></div>
    <div className="cc-layers">{(["План","События","Всё"] as Layer[]).map(item=><button className={layer===item?"active":""} onClick={()=>setLayer(item)} key={item}>{item}</button>)}</div>
    <div className="cc-period"><div><button aria-label="Предыдущий период"><ChevronLeft/></button><h2>{view==="week"?"12–18 октября":"Октябрь 2026"}</h2><button aria-label="Следующий период"><ChevronRight/></button></div><div className="cc-view"><button className={view==="week"?"active":""} onClick={()=>setView("week")}>Неделя</button><button className={view==="month"?"active":""} onClick={()=>setView("month")}>Месяц</button></div></div>
   </header>
   {view==="week"?<Week layer={layer}/>:<Month layer={layer}/>} 
  </main>
  <div className="cc-demo"><button aria-label="Демо" title="Демо" onClick={()=>setDemoOpen(v=>!v)}><Settings2/></button>{demoOpen&&<div><b>Демо</b><span>Октябрь 2026</span></div>}</div>
  <nav className="cc-mobile-nav"><button onClick={onThoughts}><LayoutGrid/>Мысли</button><button className="active"><CalendarDays/>Календарь</button><button className="new" onClick={onNew}><Plus/></button><button onClick={onProfile}><UserRound/>Профиль</button></nav>
 </div>
}
function Week({layer}:{layer:Layer}){return <section className="cc-week">{week.map(date=>{const key=iso(date);const items=publications.filter(item=>item.date===key);const images=eventImages[key]||[];const today=date.getDate()===14;const slot=date.getDate()===17;return <article className={today?"today":""} key={key}><header><span>{weekDay(date)}</span><b>{date.getDate()}</b>{today&&<small>сегодня</small>}</header><div className="cc-day-content">{items.map(item=><Publication key={item.title} item={item}/>)}{date.getDate()===15&&<div className="cc-shoot"><Camera/><span>Снять 3 кадра<small>Привычка и мотивация</small></span></div>}{slot&&<button className="cc-slot"><Plus/>Свободно</button>}</div>{layer==="Всё"&&images.length>0&&<footer><span>События</span><div>{images.map(src=><img src={src} alt="" key={src}/>)}</div></footer>}</article>})}</section>}
function Month({layer}:{layer:Layer}){const labels=useMemo(()=>week.map(d=>weekDay(d)),[]);return <section className="cc-month"><header>{labels.map(d=><span key={d}>{d}</span>)}</header><div>{month.map((date,index)=>{if(!date)return <article className="outside" key={index}/>;const key=iso(date);const items=publications.filter(item=>item.date===key);const images=eventImages[key]||[];return <article className={date.getDate()===14?"today":""} key={key}><b>{date.getDate()}</b>{items.map(item=><button className="month-pub" key={item.title}><i className={`dot ${item.status.replace(" ","-")}`}/>{item.title}</button>)}{layer==="Всё"&&images.length>0&&<div className="month-events">{images.slice(0,2).map(src=><img src={src} alt="" key={src}/>)}{images.length>2&&<span>+{images.length-2}</span>}</div>}</article>})}</div></section>}
