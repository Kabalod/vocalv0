"use client";

import { useMemo, useState } from "react";
import {
  CalendarDays, Camera, Check, ChevronDown, ChevronLeft, ChevronRight,
  GalleryHorizontal, Image as ImageIcon, LayoutGrid, MapPin, Mic, Pause,
  Play, Plus, Search, Type, UserRound, Video, X,
} from "lucide-react";
import "./events-diary.css";

type Demo = "empty" | "day" | "processing" | "selected" | "month";
type View = "day" | "month";
type Capture = "camera" | "gallery" | "voice" | "text" | null;
type EventKind = "photo" | "video" | "voice" | "text";
type DiaryEvent = { id:number; time:string; kind:EventKind; title:string; place?:string; duration?:string; image?:string; thought?:string; processing?:boolean };

type Props = { onThoughts:()=>void; onProfile:()=>void; onNew:()=>void; onLayer:(layer:"План"|"События"|"Всё")=>void };

const events:DiaryEvent[] = [
  { id:1,time:"08:10",kind:"photo",title:"Кофе на подоконнике, первый раз без телефона",place:"Дома",image:"/events/coffee.png",thought:"Утро без телефона" },
  { id:2,time:"09:30",kind:"video",title:"Дорога в зал",place:"Хамовники",duration:"0:24",image:"/events/gym-road.png" },
  { id:3,time:"13:05",kind:"voice",title:"Мысль: люди бросают не спорт, а слишком большой план",place:"Парк Горького",duration:"0:41",thought:"Ритм без мотивации" },
  { id:4,time:"16:20",kind:"video",title:"После тренировки — дождь и пустой город",duration:"0:18",image:"/events/evening.png",processing:true },
  { id:5,time:"19:40",kind:"text",title:"Записать про 15 минут в плохой день",thought:"Привычка и мотивация" },
];
const week = [{d:"Пн",n:13},{d:"Вт",n:14},{d:"Ср",n:15},{d:"Чт",n:16},{d:"Пт",n:17},{d:"Сб",n:18},{d:"Вс",n:19}];
const monthDays = Array.from({length:35},(_,i)=>i<3?null:i-2>31?null:i-2);
const captures = [
  {id:"camera" as const,label:"Камера",icon:Camera}, {id:"gallery" as const,label:"Галерея",icon:GalleryHorizontal},
  {id:"voice" as const,label:"Голос",icon:Mic}, {id:"text" as const,label:"Текст",icon:Type},
];

export default function EventsDiary({onThoughts,onProfile,onNew,onLayer}:Props){
  const [view,setView]=useState<View>("month");
  const [demo,setDemo]=useState<Demo>("month");
  const [dayOpen,setDayOpen]=useState(true);
  const [selected,setSelected]=useState<number[]>([]);
  const [captureMenu,setCaptureMenu]=useState(false);
  const [capture,setCapture]=useState<Capture>(null);
  const [saved,setSaved]=useState(false);
  const empty=demo==="empty";
  const displayEvents=useMemo(()=>events.map(event=>({...event,processing:demo==="processing"&&event.id===4})),[demo]);
  const applyDemo=(next:Demo)=>{setDemo(next);setSelected(next==="selected"?[1,2,3]:[]);if(next==="month")setView("month");if(next==="day"||next==="processing"||next==="selected")setView("day")};
  const toggle=(id:number)=>setSelected(current=>current.includes(id)?current.filter(item=>item!==id):[...current,id]);
  const openDay=()=>{setDayOpen(true);setView("day");setDemo("day")};
  return <div className="events-diary">
    <header className="ed-global"><button className="ed-brand" onClick={onThoughts}>Vocal</button><nav><button onClick={onThoughts}>Мысли</button><button className="active">Календарь</button><button onClick={onProfile}>Профиль</button></nav><button className="ed-avatar" onClick={onProfile} aria-label="Профиль"><UserRound/></button></header>
    <main className="ed-main">
      <header className="ed-heading">
        <div><span>Личный дневник</span><h1>Мои события</h1></div>
        <div className="ed-heading-actions"><label className="ed-search"><Search/><input aria-label="Поиск" placeholder="Найти в подписях и расшифровках"/></label><div className="ed-capture-wrap"><button className="ed-primary" onClick={()=>setCaptureMenu(v=>!v)}><Plus/>Событие</button>{captureMenu&&<CaptureMenu onPick={(value)=>{setCapture(value);setCaptureMenu(false)}}/>}</div></div>
      </header>
      <div className="ed-toolbar">
        <div className="ed-layers"><button onClick={()=>onLayer("План")}>План</button><button className="active">События</button><button onClick={()=>onLayer("Всё")}>Всё</button></div>
        <div className="ed-period"><div className="ed-view"><button className={view==="day"?"active":""} onClick={()=>setView("day")}>День</button><button className={view==="month"?"active":""} onClick={()=>setView("month")}>Месяц</button></div><button aria-label="Назад"><ChevronLeft/></button><button aria-label="Вперёд"><ChevronRight/></button><button>Сегодня</button></div>
      </div>
      <WeekStrip onDay={openDay}/>
      {empty?<EmptyDiary onAdd={()=>setCaptureMenu(true)}/>:<div className="ed-workspace">
        {view==="month"?<MonthGrid onDay={openDay}/>:<DayFeed events={displayEvents} selected={selected} onToggle={toggle}/>} 
        {dayOpen&&<DayPanel events={displayEvents} selected={selected} onToggle={toggle} onClose={()=>setDayOpen(false)}/>} 
      </div>}
    </main>
    <div className="ed-demo"><label htmlFor="ed-demo">Демо</label><select id="ed-demo" value={demo} onChange={e=>applyDemo(e.target.value as Demo)}><option value="empty">Пустой дневник</option><option value="day">День · 5 событий</option><option value="processing">Обработка видео</option><option value="selected">Выбрано 3</option><option value="month">Месяц</option></select></div>
    <nav className="ed-mobile-nav"><button onClick={onThoughts}><LayoutGrid/>Мысли</button><button className="active"><CalendarDays/>Календарь</button><button className="new" onClick={()=>setCaptureMenu(true)} aria-label="Добавить"><Plus/></button><button onClick={onProfile}><UserRound/>Профиль</button></nav>
    {captureMenu&&<div className="ed-mobile-capture"><button className="ed-grab" onClick={()=>setCaptureMenu(false)}/><p>Новая мысль <span>·</span> <b>Событие</b></p><CaptureChoices onPick={(value)=>{setCapture(value);setCaptureMenu(false)}}/></div>}
    {capture&&<CaptureSheet type={capture} saved={saved} onClose={()=>{setCapture(null);setSaved(false)}} onSave={()=>setSaved(true)}/>} 
  </div>
}

function CaptureMenu({onPick}:{onPick:(value:Exclude<Capture,null>)=>void}){return <div className="ed-capture-menu"><p>Новое событие</p>{captures.map(({id,label,icon:Icon})=><button key={id} onClick={()=>onPick(id)}><span><Icon/></span>{label}</button>)}</div>}
function CaptureChoices({onPick}:{onPick:(value:Exclude<Capture,null>)=>void}){return <div className="ed-capture-choices">{captures.map(({id,label,icon:Icon})=><button key={id} onClick={()=>onPick(id)}><span><Icon/></span>{label}</button>)}</div>}
function WeekStrip({onDay}:{onDay:()=>void}){return <div className="ed-week-strip">{week.map(item=><button className={item.n===14?"active":""} key={item.n} onClick={onDay}><small>{item.d}</small><b>{item.n}</b>{item.n===14&&<i/>}</button>)}</div>}
function EmptyDiary({onAdd}:{onAdd:()=>void}){return <section className="ed-empty"><span><ImageIcon/></span><h2>Сохраняйте моменты дня</h2><p>Фото, видео, голос — из них потом соберутся мысли и кадры.</p><button className="ed-primary" onClick={onAdd}><Plus/>Первое событие</button></section>}
function MonthGrid({onDay}:{onDay:()=>void}){return <section className="ed-month"><header>{["Пн","Вт","Ср","Чт","Пт","Сб","Вс"].map(day=><span key={day}>{day}</span>)}</header><div>{monthDays.map((day,index)=><button className={`${!day?"outside ":""}${day===14?"today has-events":""}`} key={index} onClick={day===14?onDay:undefined} disabled={!day}>{day&&<><b>{day}</b>{day===14&&<><img src="/events/coffee.png" alt="Кофе на подоконнике"/><span className="ed-count">5</span></>}{day===6&&<img src="/events/evening.png" alt="Вечерняя заметка"/>}{day===9&&<><img src="/events/gym-road.png" alt="Дорога в зал"/><Play className="ed-play"/></>}{day===21&&<img src="/events/evening.png" alt="Вечерняя заметка"/>}</>}</button>)}</div></section>}
function DayFeed({events,selected,onToggle}:{events:DiaryEvent[];selected:number[];onToggle:(id:number)=>void}){return <section className="ed-day-feed"><div className="ed-day-title"><span>Вторник</span><h2>14 октября</h2><small>5 событий</small></div>{events.map(event=><EventCard key={event.id} event={event} selected={selected.includes(event.id)} selection={selected.length>0} onToggle={()=>onToggle(event.id)}/>)}</section>}
function DayPanel({events,selected,onToggle,onClose}:{events:DiaryEvent[];selected:number[];onToggle:(id:number)=>void;onClose:()=>void}){return <aside className="ed-day-panel"><header><div><small>День</small><h2>Вт, 14 октября</h2></div><button onClick={onClose} aria-label="Закрыть"><X/></button></header><div className="ed-panel-feed">{events.map(event=><EventCard key={event.id} event={event} compact selected={selected.includes(event.id)} selection={selected.length>0} onToggle={()=>onToggle(event.id)}/>)}</div>{selected.length>0&&<SelectionBar count={selected.length}/>}</aside>}
function EventCard({event,selected,selection,onToggle,compact=false}:{event:DiaryEvent;selected:boolean;selection:boolean;onToggle:()=>void;compact?:boolean}){return <article className={`ed-event ${selected?"selected":""} ${compact?"compact":""}`} onDoubleClick={onToggle} onContextMenu={e=>{e.preventDefault();onToggle()}}><button className={`ed-check ${selection?"visible":""}`} onClick={onToggle} aria-label={selected?"Снять выбор":"Выбрать"}>{selected&&<Check/>}</button><time>{event.time}</time><div className="ed-event-body"><EventMedia event={event}/><div className="ed-event-copy"><p>{event.title}</p>{event.place&&<span><MapPin/>{event.place}</span>}{event.kind!=="photo"&&event.kind!=="text"&&<button className="ed-transcript">Расшифровка <ChevronDown/></button>}{event.thought&&<small>в мысли: <b>{event.thought}</b></small>}</div></div></article>}
function EventMedia({event}:{event:DiaryEvent}){if(event.kind==="voice")return <div className="ed-wave"><button aria-label="Воспроизвести"><Play/></button><Wave/><span>{event.duration}</span></div>;if(event.kind==="text")return <blockquote>«15 минут в плохой день — тоже ритм»</blockquote>;return <div className="ed-media"><img src={event.image} alt=""/>{event.kind==="video"&&<><span className="ed-media-play"><Play/></span><small>{event.duration}</small></>}{event.processing&&<div className="ed-processing"><span/><b>Сжимаю и расшифровываю…</b></div>}</div>}
function Wave(){return <span className="ed-wave-lines">{[7,14,10,20,13,24,18,10,17,23,12,19,8,15,10,21,12,7].map((height,i)=><i style={{height}} key={i}/>)}</span>}
function SelectionBar({count}:{count:number}){return <div className="ed-selection"><span>Выбрано {count}</span><button>Добавить в мысль…</button><button className="ed-primary">Сделать мысль</button></div>}
function CaptureSheet({type,saved,onClose,onSave}:{type:Exclude<Capture,null>;saved:boolean;onClose:()=>void;onSave:()=>void}){const item=captures.find(item=>item.id===type)!;const Icon=item.icon;if(type==="voice")return <div className="ed-modal"><section className="ed-voice-sheet"><header><button onClick={onClose}><X/></button><h2>Голос</h2><button onClick={onSave}>Готово</button></header><div className="ed-voice-center"><Wave/><time>00:18</time><button className="ed-record"><Pause/></button><p>Говорите свободно — подпись появится из расшифровки</p></div></section></div>;return <div className="ed-modal" onMouseDown={e=>{if(e.target===e.currentTarget)onClose()}}><section className="ed-capture-sheet"><header><div><span><Icon/></span><div><small>Новое событие</small><h2>{item.label}</h2></div></div><button onClick={onClose}><X/></button></header>{saved?<div className="ed-saved"><span><Check/></span><h3>Событие сохранено</h3><button onClick={onClose}>Готово</button></div>:<><div className="ed-capture-preview">{type==="text"?<Type/>:<img src={type==="gallery"?"/events/coffee.png":"/events/gym-road.png"} alt="Превью события"/>}</div><input placeholder={type==="camera"||type==="gallery"?"Подпись (необязательно)":"Подпись появится из расшифровки"}/><div className="ed-sheet-actions"><button><MapPin/>Место</button><button className="ed-primary" onClick={onSave}>Сохранить</button></div></>}</section></div>}
