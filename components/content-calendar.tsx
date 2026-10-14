"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays, Camera, Check, ChevronDown, ChevronLeft, ChevronRight,
  Image as ImageIcon, LayoutGrid, List, MapPin, Menu, Mic, Plus, Search,
  Sidebar, UserRound, Video, X,
} from "lucide-react";
import "./content-calendar.css";

type Layer = "План" | "События" | "Всё";
type View = "day" | "week" | "month";
type CalItem = { id: string; date: number; time?: string; title: string; meta: string; kind: "publication" | "task" | "event" | "slot"; image?: string };

const items: CalItem[] = [
  { id:"pub-1", date:14, time:"11:30", title:"Почему я ушёл из найма", meta:"Карусель · В работе", kind:"publication" },
  { id:"pub-2", date:16, time:"18:00", title:"Привычка и мотивация", meta:"Рилс · Готово", kind:"publication" },
  { id:"task-1", date:15, title:"Снять 3 кадра", meta:"Привычка и мотивация", kind:"task" },
  { id:"slot-1", date:17, title:"Свободно", meta:"Слот ритма", kind:"slot" },
  { id:"event-6", date:6, time:"18:20", title:"Вечерняя прогулка", meta:"Набережная", kind:"event", image:"/events/evening.png" },
  { id:"event-9", date:9, time:"09:30", title:"Дорога в зал", meta:"Видео · 0:24", kind:"event", image:"/events/gym-road.png" },
  { id:"event-14-1", date:14, time:"08:10", title:"Кофе на подоконнике", meta:"Фото · Дома", kind:"event", image:"/events/coffee.png" },
  { id:"event-14-2", date:14, time:"09:30", title:"Дорога в зал", meta:"Видео · 0:24", kind:"event", image:"/events/gym-road.png" },
  { id:"event-14-3", date:14, time:"13:05", title:"Мысль после тренировки", meta:"Голос · 0:41", kind:"event" },
  { id:"event-14-4", date:14, time:"16:20", title:"Свет в студии", meta:"Видео · 0:18", kind:"event", image:"/events/evening.png" },
  { id:"event-14-5", date:14, time:"19:40", title:"Итог дня", meta:"Текст", kind:"event" },
];
const undated = ["Утро без телефона", "Три ошибки новичка в зале"];
const dayNames = ["пн","вт","ср","чт","пт","сб","вс"];
const shortNames = ["П","В","С","Ч","П","С","В"];
const weekDates = [12,13,14,15,16,17,18];
const monthCells = [28,29,30,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,1];

function visibleItems(layer: Layer) {
  return items.filter(item => layer === "Всё" || (layer === "План" ? item.kind !== "event" : item.kind === "event"));
}
function KindIcon({kind}:{kind:CalItem["kind"]}) {
  if (kind === "event") return <ImageIcon />;
  if (kind === "task") return <Camera />;
  return <CalendarDays />;
}

export default function ContentCalendar({onThoughts,onProfile,onNew}:{onThoughts:()=>void;onProfile:()=>void;onNew:()=>void}) {
  const [layer,setLayer] = useState<Layer>("План");
  const [view,setView] = useState<View>("month");
  const [selectedDay,setSelectedDay] = useState(14);
  const [sidebarOpen,setSidebarOpen] = useState(true);
  const [sheet,setSheet] = useState<"add"|"undated"|"detail"|null>(null);
  const [selectedEvent,setSelectedEvent] = useState<CalItem>(items.find(i=>i.id==="event-14-1")!);
  const [selection,setSelection] = useState<string[]>([]);
  const [selecting,setSelecting] = useState(false);
  useEffect(()=>{ if (window.matchMedia("(min-width: 800px)").matches) setView("week"); },[]);
  const filtered = useMemo(()=>visibleItems(layer),[layer]);
  const openEvent = (item:CalItem) => {
    if(selecting){ setSelection(old=>old.includes(item.id)?old.filter(id=>id!==item.id):[...old,item.id]); return; }
    setSelectedEvent(item); setSheet("detail");
  };
  return <div className={`apple-cal ${sidebarOpen?"has-sidebar":""}`}>
    <DesktopSidebar selectedDay={selectedDay} setSelectedDay={setSelectedDay} />
    <main className="ac-main">
      <header className="ac-toolbar">
        <div className="ac-tools-left"><button aria-label="Скрыть боковую панель" onClick={()=>setSidebarOpen(v=>!v)}><Sidebar/></button><button aria-label="Добавить" onClick={()=>setSheet("add")}><Plus/></button></div>
        <div className="ac-mobile-year"><button>‹ 2026</button></div>
        <div className="native-segment view-segment">{(["day","week","month"] as View[]).map((v,i)=><button key={v} className={view===v?"active":""} onClick={()=>setView(v)}>{["День","Неделя","Месяц"][i]}</button>)}</div>
        <div className="ac-tools-right"><button aria-label="Поиск"><Search/></button><button className="ac-list-toggle" aria-label="Лента дней" onClick={()=>setView(view==="week"?"month":"week")}><List/></button><div className="today-control"><button aria-label="Назад"><ChevronLeft/></button><button onClick={()=>setSelectedDay(14)}>Сегодня</button><button aria-label="Вперёд"><ChevronRight/></button></div><button className="mobile-add" aria-label="Добавить" onClick={()=>setSheet("add")}><Plus/></button></div>
      </header>
      <div className="ac-heading"><h1>{view==="week"?<><strong>12–18 октября</strong> <span>2026</span></>:<><strong>Октябрь</strong> <span>2026</span></>}</h1>{layer==="События"&&<button className="select-button" onClick={()=>{setSelecting(v=>!v);setSelection([])}}>{selecting?"Готово":"Выбрать"}</button>}</div>
      <div className="mobile-undated" onClick={()=>setSheet("undated")}>2 мысли без даты <ChevronRight/></div>
      <div className="native-segment layer-segment">{(["План","События","Всё"] as Layer[]).map(value=><button key={value} className={layer===value?"active":""} onClick={()=>setLayer(value)}>{value}</button>)}</div>
      <div className="ac-content">
        {view==="week"&&<WeekView items={filtered} layer={layer} onEvent={openEvent} selection={selection}/>} 
        {view==="month"&&<MonthView items={filtered} layer={layer} selectedDay={selectedDay} setSelectedDay={setSelectedDay} onEvent={openEvent} selection={selection}/>} 
        {view==="day"&&<DayView items={filtered.filter(i=>i.date===selectedDay)} selectedDay={selectedDay} onEvent={openEvent} selectedEvent={selectedEvent} selection={selection}/>} 
      </div>
    </main>
    <MobileTabs onThoughts={onThoughts} onProfile={onProfile}/>
    {selecting&&selection.length>0&&<div className="selection-bar"><span>Выбрано {selection.length}</span><button onClick={onNew}>Сделать мысль</button></div>}
    {sheet&&<Sheet type={sheet} close={()=>setSheet(null)} event={selectedEvent} onNew={onNew}/>} 
  </div>;
}

function DesktopSidebar({selectedDay,setSelectedDay}:{selectedDay:number;setSelectedDay:(n:number)=>void}){
 return <aside className="ac-sidebar"><div className="ac-brand">Vocal</div><section className="mini-cal"><header><b>Октябрь 2026</b><span>‹ &nbsp; ›</span></header><div className="mini-weekdays">{shortNames.map((n,i)=><span key={i}>{n}</span>)}</div><div className="mini-grid">{monthCells.map((d,i)=><button key={i} className={`${i<3||i>33?"outside":""} ${d===14?"today":""} ${d===selectedDay?"selected":""}`} onClick={()=>setSelectedDay(d)}>{d}</button>)}</div></section><SidebarGroup title="Слои"><label><i className="publication"/><Check/>Публикации</label><label><i className="task"/><Check/>Задачи съёмки</label><label><i className="event"/><Check/>События</label></SidebarGroup><SidebarGroup title="Без даты (2)">{undated.map(title=><button className="undated-card" draggable key={title}><span>{title}</span><small>Перетащите на день</small></button>)}</SidebarGroup></aside>
}
function SidebarGroup({title,children}:{title:string;children:React.ReactNode}){return <section className="sidebar-group"><h3>{title}<ChevronDown/></h3>{children}</section>}

function WeekView({items:shown,layer,onEvent,selection}:{items:CalItem[];layer:Layer;onEvent:(i:CalItem)=>void;selection:string[]}){
 return <section className="week-view"><div className="week-head"><span className="all-day-label">весь день</span>{weekDates.map((date,i)=><div key={date} className={date===14?"today":""}><span>{dayNames[i]}</span><b>{date}</b></div>)}</div><div className="all-day-row"><span/>{weekDates.map(date=><div key={date}>{shown.filter(i=>i.date===date&&!i.time).map(item=><CalendarBlock key={item.id} item={item} onClick={()=>onEvent(item)} selected={selection.includes(item.id)}/>)}</div>)}</div><div className="time-grid"><div className="hours">{Array.from({length:15},(_,i)=><span key={i}>{i+8}:00</span>)}</div>{weekDates.map(date=><div className={`time-column ${date===14?"today":""}`} key={date}>{shown.filter(i=>i.date===date&&i.time).map(item=><CalendarBlock key={item.id} item={item} onClick={()=>onEvent(item)} selected={selection.includes(item.id)} timed/>)}{date===14&&<i className="now-line"/>}</div>)}</div>{layer==="События"&&<p className="week-hint">Нажмите на событие, чтобы открыть детали</p>}</section>
}
function CalendarBlock({item,onClick,timed,selected}:{item:CalItem;onClick:()=>void;timed?:boolean;selected:boolean}){return <button className={`calendar-block ${item.kind} ${timed?"timed":""} ${selected?"selected":""}`} onClick={onClick}>{item.time&&<time>{item.time}</time>}<strong>{item.kind==="slot"?"+ ":""}{item.title}</strong>{item.kind!=="slot"&&<small>{item.meta}</small>}{selected&&<Check className="block-check"/>}</button>}

function MonthView({items:shown,layer,selectedDay,setSelectedDay,onEvent,selection}:{items:CalItem[];layer:Layer;selectedDay:number;setSelectedDay:(n:number)=>void;onEvent:(i:CalItem)=>void;selection:string[]}){
 const selectedItems=shown.filter(i=>i.date===selectedDay);
 return <section className="month-view"><div className="month-weekdays">{shortNames.map((d,i)=><span key={i}><i>{d}</i><em>{dayNames[i]}</em></span>)}</div><div className="month-grid">{monthCells.map((date,index)=>{const outside=index<3||index>33;const dayItems=outside?[]:shown.filter(i=>i.date===date);const photos=dayItems.filter(i=>i.kind==="event"&&i.image);return <button key={index} className={`${outside?"outside":""} ${date===14&&!outside?"today":""} ${date===selectedDay&&!outside?"selected":""} ${layer==="События"&&photos.length?"photo-day":""}`} onClick={()=>!outside&&setSelectedDay(date)}>{layer==="События"&&photos.length?<img src={photos[0].image} alt=""/>:null}<b>{date}</b><div className="day-dots">{dayItems.slice(0,3).map(item=><i className={item.kind} key={item.id}/>)}</div><div className="desktop-day-items">{dayItems.slice(0,3).map(item=><span key={item.id}><i className={item.kind}/><em>{item.title}</em><time>{item.time}</time></span>)}{dayItems.length>3&&<small>ещё {dayItems.length-3}</small>}</div></button>})}</div><div className="selected-day-list"><h2>Среда, {selectedDay} октября</h2>{selectedItems.length?<div className="inset-list">{selectedItems.map(item=><DayRow item={item} key={item.id} onClick={()=>onEvent(item)} selected={selection.includes(item.id)}/>)}</div>:<p>Нет событий</p>}</div></section>
}
function DayView({items:shown,selectedDay,onEvent,selectedEvent,selection}:{items:CalItem[];selectedDay:number;onEvent:(i:CalItem)=>void;selectedEvent:CalItem;selection:string[]}){
 return <section className="day-view"><div className="day-list"><h2>Среда, {selectedDay} октября</h2><div className="inset-list">{shown.map(item=><DayRow key={item.id} item={item} onClick={()=>onEvent(item)} selected={selection.includes(item.id)}/>)}</div></div>{shown.some(i=>i.kind==="event")&&<EventInspector event={selectedEvent}/>}</section>
}
function DayRow({item,onClick,selected}:{item:CalItem;onClick:()=>void;selected:boolean}){return <button className={`day-row ${item.kind} ${selected?"selected":""}`} onClick={onClick}>{item.image?<img src={item.image} alt=""/>:<span className="row-icon"><KindIcon kind={item.kind}/></span>}<span><strong>{item.title}</strong><small>{item.time?`${item.time} · `:""}{item.meta}</small></span>{selected&&<span className="row-check"><Check/></span>}<ChevronRight/></button>}
function EventInspector({event}:{event:CalItem}){return <aside className="event-inspector">{event.image&&<img src={event.image} alt={event.title}/>}<div><span className="inspector-time">14 октября · {event.time}</span><h2>{event.title}</h2><p><MapPin/> Дома, Москва</p><h3>Расшифровка</h3><p>Тихое утро. Свет ложится на подоконник, и впервые за неделю никуда не хочется спешить.</p><h3>В мысли</h3><p>Утро без телефона</p><button>Сделать мысль</button><button className="secondary">Добавить в мысль…</button></div></aside>}

function MobileTabs({onThoughts,onProfile}:{onThoughts:()=>void;onProfile:()=>void}){return <nav className="ac-mobile-tabs"><button onClick={onThoughts}><LayoutGrid/>Мысли</button><button className="active"><CalendarDays/>Календарь</button><button onClick={onProfile}><UserRound/>Профиль</button></nav>}
function Sheet({type,close,event,onNew}:{type:"add"|"undated"|"detail";close:()=>void;event:CalItem;onNew:()=>void}){return <div className="sheet-backdrop" onMouseDown={close}><section className={`bottom-sheet ${type}`} role="dialog" aria-modal="true" aria-label={type==="add"?"Добавить":"Детали события"} onMouseDown={e=>e.stopPropagation()}><div className="sheet-handle"/><button className="sheet-close" aria-label="Закрыть" onClick={close}><X/></button>{type==="add"&&<><h2>Добавить</h2><button className="sheet-action" onClick={onNew}><span><Mic/></span><b>Новая мысль</b><ChevronRight/></button><button className="sheet-action" onClick={close}><span><CalendarDays/></span><b>Событие</b><ChevronRight/></button><button className="sheet-action" onClick={()=>{}}><span><List/></span><b>Мысли без даты</b><small>2</small><ChevronRight/></button></>}{type==="undated"&&<><h2>Без даты</h2><div className="inset-list">{undated.map(title=><button className="sheet-action" key={title}><span><CalendarDays/></span><b>{title}</b><ChevronRight/></button>)}</div></>}{type==="detail"&&<><div className="sheet-hero">{event.image?<img src={event.image} alt={event.title}/>:<Mic/>}</div><span className="inspector-time">Среда, 14 октября · {event.time}</span><h2>{event.title}</h2><p className="sheet-meta">{event.meta} · Москва</p><h3>Расшифровка</h3><p>Тихое утро. Свет ложится на подоконник, и впервые за неделю никуда не хочется спешить.</p><button className="primary-wide">Сделать мысль</button><button className="secondary-wide">Добавить в мысль…</button></>}</section></div>}
