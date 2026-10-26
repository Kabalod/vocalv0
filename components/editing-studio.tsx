"use client";

import { useMemo, useState } from "react";
import { Check, ChevronRight, Clipboard, GripVertical, Image as ImageIcon, Plus, RefreshCw, Sparkles, Video, X } from "lucide-react";
import "./editing-studio.css";

type DemoState = "no-script" | "empty" | "building" | "ready" | "shoot" | "updated";
type Shot = { id: number; block: string; seconds: number; phrase: string; visual: string; size: string; overlay?: string; event?: { title: string; image: string } };

const initialShots: Shot[] = [
  { id: 1, block: "Хук", seconds: 3, phrase: "Вы бросаете не спорт, а план", visual: "Смотрю прямо в камеру", size: "Крупный", overlay: "Дело не в силе воли" },
  { id: 2, block: "Суть", seconds: 6, phrase: "В январе мы берём план на человека, которым хотим стать", visual: "Иду по улице", size: "Средний", event: { title: "Дорога в зал", image: "/events/gym-road.png" } },
  { id: 3, block: "Суть", seconds: 5, phrase: "15 минут хватит", visual: "Таймер на телефоне", size: "Деталь" },
  { id: 4, block: "Пример", seconds: 8, phrase: "Дорога в зал — уже часть истории", visual: "Иду по улице", size: "Общий", event: { title: "Дорога в зал", image: "/events/gym-road.png" } },
  { id: 5, block: "Призыв", seconds: 5, phrase: "Сохраните и напишите СТАРТ", visual: "Смотрю в камеру", size: "Крупный" },
];
const blocks = ["Хук", "Суть", "Пример", "Призыв"];
const eventOptions = [
  { title: "Дорога в зал", image: "/events/gym-road.png", note: "подходит к движению" },
  { title: "Кофе на подоконнике", image: "/events/coffee.png", note: "из этой мысли" },
  { title: "Вечер после тренировки", image: "/events/evening.png", note: "предложено Vocal" },
];

export default function EditingStudio({ initialShoot = false }: { initialShoot?: boolean }) {
  const [demo, setDemo] = useState<DemoState>(initialShoot ? "shoot" : "ready");
  const [shots, setShots] = useState(initialShots);
  const [format, setFormat] = useState("Говорящая голова");
  const [target, setTarget] = useState(30);
  const [editing, setEditing] = useState<Shot | null>(null);
  const [dragged, setDragged] = useState<number | null>(null);
  const duration = useMemo(() => shots.reduce((sum, shot) => sum + shot.seconds, 0), [shots]);
  const shooting = demo === "shoot";
  const moveShot = (targetId: number) => {
    if (dragged === null || dragged === targetId) return;
    setShots(current => { const copy = [...current]; const from = copy.findIndex(s => s.id === dragged); const to = copy.findIndex(s => s.id === targetId); const [item] = copy.splice(from, 1); copy.splice(to, 0, item); return copy; });
    setDragged(null);
  };
  const addShot = (block: string) => setShots(current => [...current, { id: Math.max(...current.map(s => s.id)) + 1, block, seconds: 3, phrase: "Новая фраза сценария", visual: "Опишите, что происходит в кадре", size: "Средний" }]);
  const saveShot = (next: Shot) => { setShots(current => current.map(s => s.id === next.id ? next : s)); setEditing(null); };

  if (shooting) return <ShootMode shots={shots.filter(s => !s.event)} onBack={() => setDemo("ready")} />;
  return <section className="montage">
    <header className="montage-toolbar">
      <div className="montage-scroll"><span className="montage-label">Тип ролика</span>{["Говорящая голова", "Голос за кадром", "Шаги", "До и после", "История"].map((item, index) => <button key={item} className={format === item ? "active" : ""} onClick={() => setFormat(item)}>{index === 0 && <span title="Предложено Vocal"><Sparkles/></span>}{item}</button>)}</div>
      <div className="montage-timing"><div className="duration-chips">{[15,30,60,90].map(value => <button className={target === value ? "active" : ""} onClick={() => setTarget(value)} key={value}>{value} с</button>)}</div><div className={`timeline ${duration > target ? "over" : ""}`}><span style={{ width: `${Math.min(100, duration / target * 100)}%` }}/><b>{duration} из {target} с</b></div></div>
    </header>
    {demo === "updated" && <div className="montage-notice"><RefreshCw/><span><b>Сценарий обновился</b> — собрать план заново?</span><button onClick={() => setDemo("building")}>Собрать заново</button><button aria-label="Закрыть" onClick={() => setDemo("ready")}><X/></button></div>}
    {demo === "no-script" ? <EmptyState icon={<Video/>} title="План монтажа строится из сценария" copy="Сначала соберите сценарий, чтобы Vocal мог разложить его на кадры." action="Перейти к сценарию" /> : demo === "empty" ? <EmptyState icon={<Sparkles/>} title="Разложу сценарий на кадры" copy="Подберу, что уже есть в дневнике, и составлю список того, что нужно доснять." action="Собрать план" onAction={() => { setDemo("building"); window.setTimeout(() => setDemo("ready"), 1300); }} /> : demo === "building" ? <LoadingPlan /> : <div className="montage-layout">
      <main className="shot-plan">{blocks.map(block => <section className="shot-block" key={block}><header><div><h2>{block}</h2>{block === "Хук" && <span>0–3 с</span>}</div><span>{shots.filter(s => s.block === block).reduce((sum,s) => sum+s.seconds,0)} с</span></header><div className="shot-list">{shots.filter(s => s.block === block).map(shot => <ShotCard key={shot.id} shot={shot} index={shots.indexOf(shot)+1} onEdit={() => setEditing(shot)} onDrag={() => setDragged(shot.id)} onDrop={() => moveShot(shot.id)} />)}</div><button className="add-shot" onClick={() => addShot(block)}><Plus/>Кадр</button></section>)}</main>
      <DiaryPanel />
    </div>}
    <div className="montage-demo"><label htmlFor="montage-state">Демо</label><select id="montage-state" value={demo} onChange={e => setDemo(e.target.value as DemoState)}><option value="no-script">Нет сценария</option><option value="empty">Пусто</option><option value="building">Сборка</option><option value="ready">Готово</option><option value="shoot">На съёмку</option><option value="updated">Сценарий обновился</option></select></div>
    {editing && <EditSheet shot={editing} onClose={() => setEditing(null)} onSave={saveShot} />}
    {demo === "ready" && <button className="shoot-fab" onClick={() => setDemo("shoot")}><Video/>На съёмку <span>3</span></button>}
  </section>;
}

function ShotCard({shot,index,onEdit,onDrag,onDrop}:{shot:Shot;index:number;onEdit:()=>void;onDrag:()=>void;onDrop:()=>void}) { return <article className="shot-card" draggable onDragStart={onDrag} onDragOver={e => e.preventDefault()} onDrop={onDrop} onClick={onEdit}><button className="shot-grip" aria-label="Перетащить кадр" onClick={e => e.stopPropagation()}><GripVertical/></button><div className="shot-script"><span>{String(index).padStart(2,"0")} · {shot.seconds} с</span><p>{shot.phrase}</p><small>{shot.size} · {shot.visual.toLocaleLowerCase()}{shot.overlay&&<> · Текст: {shot.overlay}</>}</small></div><Source shot={shot}/></article> }
function Source({shot}:{shot:Shot}) { return <div className="shot-source">{shot.event ? <><img src={shot.event.image} alt=""/><div><b>Есть · 14 окт</b><span>{shot.event.title}</span>{shot.id===2&&<em>уже в кадре 04</em>}<button>Заменить</button></div></> : <><span className="reshoot">Доснять</span><button>Запланировать на…</button></>}</div> }
function DiaryPanel(){return <aside className="diary-panel"><header><span>Материалы</span><h2>Из дневника</h2><p>Перетащите событие на нужный кадр</p></header><div className="diary-events">{eventOptions.map((event,index)=><article draggable key={event.title}><img src={event.image} alt=""/><div><b>{event.title}</b><span>14 октября · {event.note}</span></div>{index===2&&<Sparkles/>}</article>)}</div><div className="shot-checklist"><div><span>Чек-лист съёмки</span><b>3</b></div><ul><li><Check/><span>01</span>Смотрю прямо в камеру</li><li><Check/><span>03</span>Таймер на телефоне</li><li><Check/><span>05</span>Смотрю в камеру</li></ul><button><Clipboard/>Копировать шот-лист</button><button><RefreshCw/>Собрать заново</button></div></aside>}
function EmptyState({icon,title,copy,action,onAction}:{icon:React.ReactNode;title:string;copy:string;action:string;onAction?:()=>void}){return <div className="montage-empty"><span>{icon}</span><h2>{title}</h2><p>{copy}</p><button onClick={onAction}>{action}</button></div>}
function LoadingPlan(){return <div className="montage-loading"><header><span/><div><i/><i/></div></header>{[1,2,3,4].map(item=><div className="loading-shot" key={item}><span/><div/><div/><div/></div>)}</div>}
function EditSheet({shot,onClose,onSave}:{shot:Shot;onClose:()=>void;onSave:(shot:Shot)=>void}){const [draft,setDraft]=useState(shot);return <div className="edit-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)onClose()}}><section className="edit-sheet" role="dialog" aria-modal="true" aria-labelledby="edit-shot-title"><button className="sheet-grab"/><header><div><small>Кадр {String(shot.id).padStart(2,"0")}</small><h2 id="edit-shot-title">Редактирование кадра</h2></div><button onClick={onClose} aria-label="Закрыть"><X/></button></header><label>Фраза сценария<textarea value={draft.phrase} onChange={e=>setDraft({...draft,phrase:e.target.value})}/></label><label>В кадре<input value={draft.visual} onChange={e=>setDraft({...draft,visual:e.target.value})}/></label><fieldset><legend>Крупность</legend><div>{["Общий","Средний","Крупный","Деталь"].map(size=><button type="button" className={draft.size===size?"active":""} onClick={()=>setDraft({...draft,size})} key={size}>{size}</button>)}</div></fieldset><label>Текст на экране<input value={draft.overlay||""} placeholder="Необязательно" onChange={e=>setDraft({...draft,overlay:e.target.value})}/></label><div className="event-picker"><span>Событие из дневника</span><div>{eventOptions.map(event=><button key={event.title} onClick={()=>setDraft({...draft,event:{title:event.title,image:event.image}})}><img src={event.image} alt=""/><b>{event.title}</b>{draft.event?.title===event.title&&<i><Check/></i>}</button>)}</div></div><button className="save-shot" onClick={()=>onSave(draft)}>Сохранить кадр</button></section></div>}
function ShootMode({shots,onBack}:{shots:Shot[];onBack:()=>void}){const [done,setDone]=useState<number[]>([]);return <section className="shoot-mode"><header><button onClick={onBack}><X/></button><div><span>Чек-лист съёмки</span><h1>Нужно доснять</h1></div><b>{done.length}/{shots.length}</b></header><main>{shots.map((shot,index)=><article className={done.includes(shot.id)?"done":""} key={shot.id}><button className="shoot-check" onClick={()=>setDone(current=>current.includes(shot.id)?current.filter(id=>id!==shot.id):[...current,shot.id])}>{done.includes(shot.id)&&<Check/>}</button><div><span>{String(index+1).padStart(2,"0")} · {shot.seconds} с · {shot.size}</span><h2>{shot.visual}</h2><p>«{shot.phrase}»</p>{shot.overlay&&<small>Текст: {shot.overlay}</small>}</div><button className="record-take"><Video/>Снять дубль</button></article>)}</main><button className="finish-shoot" onClick={onBack}>Готово</button></section>}
