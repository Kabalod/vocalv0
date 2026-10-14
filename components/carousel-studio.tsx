"use client";

import { useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Copy, Download, GalleryHorizontal, GripVertical, Camera, LayoutGrid, List, MessageSquareQuote, MoreHorizontal, Plus, RefreshCw, Share, Sparkles, Trash2, Type, X } from "lucide-react";
import "./carousel-studio.css";
import "./carousel-studio-mobile.css";

type StudioState = "no-script" | "empty" | "building" | "error" | "quota" | "ready";
type ThemeName = "graphite" | "paper" | "contrast";
type MobileSheet = "edit" | "layout" | "theme" | "order" | "share" | null;
type EditableField = "kicker" | "title" | "body";
type Slide = { id: number; kicker: string; title: string; body: string; layout: number };

const initialSlides: Slide[] = [
  { id: 1, kicker: "Привычка и мотивация", title: "Мотивация исчезает. Привычка остаётся.", body: "Почему первый шаг важнее желания", layout: 0 },
  { id: 2, kicker: "01", title: "На третий день мне стало лень", body: "Но я всё равно вышел — просто потому, что делал это вчера.", layout: 1 },
  { id: 3, kicker: "Главная мысль", title: "Привычка держится не на желании", body: "Она держится на простом, повторяемом первом шаге.", layout: 2 },
  { id: 4, kicker: "02", title: "Упростите вход", body: "Не «пробежать пять километров», а просто надеть кроссовки.", layout: 3 },
  { id: 5, kicker: "Формула", title: "Маленькое действие → знакомый ритм", body: "Ритм постепенно становится сильнее настроения.", layout: 4 },
  { id: 6, kicker: "Попробуйте сегодня", title: "Выберите шаг, который невозможно не сделать", body: "Две минуты. Один повтор. Никаких переговоров с собой.", layout: 5 },
  { id: 7, kicker: "Сохраните", title: "Не ждите мотивацию. Создайте ритм.", body: "@vocal · Мысли, которые становятся контентом", layout: 6 },
];

const layoutIcons = [Type, List, MessageSquareQuote, LayoutGrid, Sparkles, GalleryHorizontal, Check];
const stateLabels: Record<StudioState, string> = { "no-script": "Нет сценария", empty: "Пусто", building: "Сборка", error: "Ошибка", quota: "Ресурс закончился", ready: "Готово" };

function StateCard({ state, onState }: { state: StudioState; onState: (value: StudioState) => void }) {
  if (state === "building") return <section className="carousel-state carousel-building"><div className="stack-placeholder skeleton"/><div className="thumb-skeletons">{Array.from({length:7},(_,i)=><i className="skeleton" key={i}/>)}</div><h2>Раскладываю мысль по слайдам…</h2></section>;
  const config = state === "no-script"
    ? { title: "Карусель делается из сценария. Сначала соберём его.", button: "Перейти к сценарию" }
    : state === "empty"
      ? { title: "Соберу карусель из вашего сценария — 6–9 слайдов, которые можно сразу выложить", button: "Сделать карусель" }
      : state === "quota"
        ? { title: "Ресурс на этот период закончился", button: "Продлить подписку" }
        : { title: "Не получилось разложить мысль. Попробуйте ещё раз", button: "Повторить" };
  return <section className="carousel-state"><div className="card-stack" aria-hidden="true"><i/><i/><i/></div><h2>{config.title}</h2><button className="carousel-primary" onClick={() => onState(state === "no-script" ? "empty" : state === "quota" ? "quota" : state === "error" ? "building" : "ready")}>{config.button}</button></section>;
}

function Editable({ value, limit, onChange, as = "p" }: { value: string; limit: number; onChange: (value: string) => void; as?: "h2" | "p" }) {
  const Tag = as;
  return <div className="editable-wrap"><Tag contentEditable suppressContentEditableWarning onInput={event => { const next = event.currentTarget.textContent || ""; if (next.length <= limit) onChange(next); else event.currentTarget.textContent = value; }}>{value}</Tag><span className={value.length >= limit ? "limit" : ""}>{value.length}/{limit}</span></div>;
}

export default function CarouselStudio() {
  const [state, setState] = useState<StudioState>("ready");
  const [slides, setSlides] = useState(initialSlides);
  const [active, setActive] = useState(0);
  const [theme, setTheme] = useState<ThemeName>("graphite");
  const [handle, setHandle] = useState("@vocal");
  const [caption, setCaption] = useState("Мотивация приходит и уходит. А привычка остаётся, если первый шаг достаточно прост. Сохраните эту карусель и выберите действие, которое займёт не больше двух минут.");
  const [stale, setStale] = useState(true);
  const [toast, setToast] = useState(false);
  const [dragged, setDragged] = useState<number | null>(null);
  const [mobileSheet, setMobileSheet] = useState<MobileSheet>(null);
  const [editingField, setEditingField] = useState<EditableField>("title");
  const swipeStart = useRef(0);
  const current = slides[active];
  const themeClass = `theme-${theme}`;
  const update = (key: keyof Slide, value: string | number) => setSlides(items => items.map((slide, index) => index === active ? { ...slide, [key]: value } : slide));
  const dots = useMemo(() => slides.map((_, index) => index), [slides]);
  const rebuild = () => { setStale(false); setState("building"); window.setTimeout(() => setState("ready"), 900); };
  const exportSlides = () => { setToast(true); window.setTimeout(() => setToast(false), 2600); };
  const fieldLabels: Record<EditableField, string> = { kicker: "Надзаголовок", title: "Заголовок", body: "Пункт 2" };
  const fieldLimits: Record<EditableField, number> = { kicker: 32, title: 60, body: 120 };
  const openEditor = (field: EditableField) => { setEditingField(field); setMobileSheet("edit"); };
  const removeSlide = (index: number) => {
    if (slides.length <= 1) return;
    setSlides(items => items.filter((_, itemIndex) => itemIndex !== index));
    setActive(currentIndex => Math.min(currentIndex, slides.length - 2));
  };

  return <section className="carousel-studio">
    <div className="carousel-state-switch"><label htmlFor="carousel-state">Состояние</label><select id="carousel-state" value={state} onChange={event => setState(event.target.value as StudioState)}>{Object.entries(stateLabels).map(([value,label])=><option value={value} key={value}>{label}</option>)}</select></div>
    {state !== "ready" ? <StateCard state={state} onState={setState}/> : <>
      <div className="carousel-mobile-ready">
        {stale&&<div className="mobile-stale">Сценарий изменился <button onClick={rebuild}>Обновить</button></div>}
        <div className="mobile-slide-track" onScroll={event => {
          const target = event.currentTarget;
          const firstSlide = target.firstElementChild as HTMLElement | null;
          if (!firstSlide) return;
          const next = Math.round(target.scrollLeft / (firstSlide.offsetWidth + 12));
          setActive(Math.max(0, Math.min(slides.length - 1, next)));
        }}>
          {slides.map((slide,index)=><article className={`mobile-editable-slide layout-${slide.layout} ${themeClass}`} key={slide.id}>
            <div className="slide-brand">VOCAL <span>{index+1}/{slides.length}</span></div>
            <button onClick={()=>{setActive(index);openEditor("kicker")}}>{slide.kicker}</button>
            <button className="mobile-slide-title" onClick={()=>{setActive(index);openEditor("title")}}>{slide.title}</button>
            <button onClick={()=>{setActive(index);openEditor("body")}}>{slide.body}</button>
            <small>{handle}</small>
          </article>)}
        </div>
        <div className="mobile-slide-meta"><div className="slide-dots" aria-label={`Слайд ${active+1} из ${slides.length}`}>{dots.map(index=><button aria-label={`Слайд ${index+1}`} className={index===active?"active":""} onClick={()=>{setActive(index);document.querySelectorAll<HTMLElement>(".mobile-editable-slide")[index]?.scrollIntoView({behavior:"smooth",inline:"start"})}} key={index}/>)}</div><span>{active+1} / {slides.length}</span></div>
        <nav className="carousel-mobile-toolbar" aria-label="Инструменты карусели">
          <button onClick={()=>setMobileSheet("layout")}><LayoutGrid/><span>Макет</span></button>
          <button onClick={()=>setMobileSheet("theme")}><Sparkles/><span>Тема</span></button>
          <button onClick={()=>setMobileSheet("order")}><List/><span>Порядок</span></button>
          <button onClick={()=>setMobileSheet("share")}><Share/><span>Скачать</span></button>
        </nav>
      </div>
      <aside className="slide-rail" aria-label="Слайды карусели"><div className="slide-strip">{slides.map((slide,index)=><button draggable onDragStart={()=>setDragged(index)} onDragOver={event=>event.preventDefault()} onDrop={()=>{if(dragged===null||dragged===index)return;const next=[...slides];const [item]=next.splice(dragged,1);next.splice(index,0,item);setSlides(next);setActive(index);setDragged(null)}} onClick={()=>setActive(index)} className={active===index?"active":""} key={slide.id}><span>{index+1}</span><GripVertical/><div className={`mini-slide ${themeClass}`}><b>{slide.title}</b></div></button>)}</div><button className="add-slide"><Plus/> Слайд</button></aside>
      <main className="carousel-canvas">
        {stale&&<div className="stale-banner">Сценарий обновился после сборки карусели <button onClick={rebuild}>Собрать заново</button></div>}
        <div className="slide-stage"><button className="slide-arrow" aria-label="Предыдущий слайд" disabled={active===0} onClick={()=>setActive(i=>Math.max(0,i-1))}><ArrowLeft/></button><article className={`editable-slide layout-${current.layout} ${themeClass}`}><div className="slide-brand">VOCAL <span>{active+1}/{slides.length}</span></div><Editable value={current.kicker} limit={32} onChange={value=>update("kicker",value)}/><Editable as="h2" value={current.title} limit={60} onChange={value=>update("title",value)}/><Editable value={current.body} limit={120} onChange={value=>update("body",value)}/><small>{handle}</small></article><button className="slide-arrow" aria-label="Следующий слайд" disabled={active===slides.length-1} onClick={()=>setActive(i=>Math.min(slides.length-1,i+1))}><ArrowRight/></button></div>
        <div className="slide-dots" aria-label={`Слайд ${active+1} из ${slides.length}`}>{dots.map(index=><button aria-label={`Слайд ${index+1}`} className={index===active?"active":""} onClick={()=>setActive(index)} key={index}/>)}</div>
      </main>
      <aside className="carousel-inspector"><div className="inspector-section"><h3>Макет</h3><div className="layout-picker">{layoutIcons.map((Icon,index)=><button className={current.layout===index?"active":""} onClick={()=>update("layout",index)} aria-label={`Макет ${index+1}`} key={index}><Icon/></button>)}</div></div><div className="inspector-section"><h3>Тема</h3><div className="theme-picker">{(["graphite","paper","contrast"] as ThemeName[]).map(item=><button className={`${item} ${theme===item?"active":""}`} onClick={()=>setTheme(item)} aria-label={`Тема ${item}`} key={item}/>)}</div></div><label className="inspector-field">Ник<input value={handle} onChange={e=>setHandle(e.target.value)} placeholder="@ник"/></label><label className="inspector-field caption-field"><span>Подпись к посту <small>{caption.length}/2200</small></span><textarea value={caption} maxLength={2200} onChange={e=>setCaption(e.target.value)}/><button onClick={()=>navigator.clipboard.writeText(caption).catch(()=>{})}><Copy/> Копировать</button></label><div className="carousel-actions"><button className="carousel-primary" onClick={exportSlides}><Download/> Скачать 7 слайдов</button><button onClick={rebuild}><RefreshCw/> Собрать заново</button></div></aside>
    </>}
    {mobileSheet&&<div className="carousel-sheet-backdrop" onMouseDown={event=>{if(event.target===event.currentTarget)setMobileSheet(null)}}>
      <section className={`carousel-mobile-sheet sheet-${mobileSheet}`} role="dialog" aria-modal="true" aria-label={mobileSheet === "edit" ? fieldLabels[editingField] : undefined}>
        <button className="carousel-sheet-grabber" aria-label="Закрыть" onClick={()=>setMobileSheet(null)}/>
        {mobileSheet==="edit"&&<><header><h2>{fieldLabels[editingField]}</h2></header><textarea autoFocus value={String(current[editingField])} maxLength={fieldLimits[editingField]} onChange={event=>update(editingField,event.target.value)}/><div className="sheet-edit-footer"><span>{String(current[editingField]).length} / {fieldLimits[editingField]}</span><button className="carousel-primary" onClick={()=>setMobileSheet(null)}>Готово</button></div></>}
        {mobileSheet==="layout"&&<><header><h2>Макет</h2><p>Выберите композицию слайда</p></header><div className="mobile-layout-grid">{layoutIcons.map((Icon,index)=><button className={current.layout===index?"active":""} onClick={()=>{update("layout",index);setMobileSheet(null)}} aria-label={`Макет ${index+1}`} key={index}><span className={`layout-thumb layout-${index}`}><Icon/></span><small>{index+1}</small></button>)}</div></>}
        {mobileSheet==="theme"&&<><header><h2>Тема</h2><p>Оформление всей карусели</p></header><div className="mobile-theme-list">{(["graphite","paper","contrast"] as ThemeName[]).map((item,index)=><button className={theme===item?"active":""} onClick={()=>{setTheme(item);setMobileSheet(null)}} key={item}><i className={item}/><span>{["Графит","Бумага","Контраст"][index]}</span>{theme===item&&<Check/>}</button>)}</div></>}
        {mobileSheet==="order"&&<><header><h2>Порядок слайдов</h2><p>Перетащите за ручку. Смахните влево, чтобы удалить.</p></header><div className="mobile-order-list">{slides.map((slide,index)=><div draggable onTouchStart={event=>{swipeStart.current=event.touches[0].clientX}} onTouchEnd={event=>{if(event.changedTouches[0].clientX-swipeStart.current < -56) removeSlide(index)}} onDragStart={()=>setDragged(index)} onDragOver={event=>event.preventDefault()} onDrop={()=>{if(dragged===null||dragged===index)return;const next=[...slides];const [item]=next.splice(dragged,1);next.splice(index,0,item);setSlides(next);setActive(index);setDragged(null)}} key={slide.id}><GripVertical/><span>{index+1}</span><div className={`order-thumb ${themeClass}`}>{slide.title}</div><button aria-label={`Удалить слайд ${index+1}`} onClick={()=>removeSlide(index)}><Trash2/></button></div>)}</div></>}
        {mobileSheet==="share"&&<><header><h2>Поделиться</h2></header><div className="share-actions"><button onClick={()=>{exportSlides();setMobileSheet(null)}}><Download/><span>Сохранить 7 изображений</span></button><button><Camera/><span>Instagram</span></button><button><MoreHorizontal/><span>Ещё</span></button></div><div className="share-caption"><span>Подпись к посту <small>{caption.length}/2200</small></span><textarea value={caption} maxLength={2200} onChange={event=>setCaption(event.target.value)}/><button onClick={()=>navigator.clipboard.writeText(caption).catch(()=>{})}><Copy/> Копировать подпись</button></div></>}
      </section>
    </div>}
    {toast&&<div className="carousel-toast" role="status"><Check/> 7 изображений 1080×1350 сохранены<button aria-label="Закрыть" onClick={()=>setToast(false)}><X/></button></div>}
  </section>;
}
