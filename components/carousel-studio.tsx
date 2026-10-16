"use client";

import { useRef, useState } from "react";
import { Check, ChevronDown, ChevronLeft, ChevronRight, Copy, Download, Eye, GripVertical, Image as ImageIcon, LayoutGrid, MoreHorizontal, Palette, Plus, Share2, Sparkles, Trash2, Type, X } from "lucide-react";
import { CarouselSlide, carouselThemeStyles, type CarouselLayout, type CarouselSlideData, type CarouselTheme } from "./carousel-slide";
import "./carousel-studio.css";
import "./carousel-studio-refinements.css";

type Mode = "slide" | "overview";
type DemoState = "no-script" | "empty" | "building" | "error" | "ready" | "updated";
type Inspector = "carousel" | "slide" | "text";
type Sheet = "text" | "theme" | "caption" | "layout" | "share" | null;

const initialSlides: CarouselSlideData[] = [
  { id: 1, layout: "photo-cover", kicker: "3 ошибки", title: "Почему вы *бросаете* спорт к середине февраля", image: "/images/carousel-author.png" },
  { id: 2, layout: "statement", title: "Дело не в *силе воли*", body: "В январе мы берём план на человека, которым только хотим стать" },
  { id: 3, layout: "list", title: "Что ломает привычку", items: ["Слишком длинные тренировки", "Цель на результат, а не на действие", "Пропуск = провал"] },
  { id: 4, layout: "split", kicker: "Дорога в зал", title: "Начните с маршрута, который уже знаком", image: "/images/carousel-road.png" },
  { id: 5, layout: "photo-example", title: "Маленький ритуал важнее идеального плана", image: "/images/carousel-coffee.png" },
  { id: 6, layout: "number", value: "15 минут", title: "Хватит, чтобы не выпасть из ритма в плохой день" },
  { id: 7, layout: "steps", title: "Как перезапуститься", items: ["Сократите план вдвое", "Отмечайте факт, а не вес", "После пропуска — сразу следующая"] },
  { id: 8, layout: "cta", title: "Сохраните, чтобы вернуться в марте" },
];
const layouts: { name: string; value: CarouselLayout }[] = [{name:"Обложка",value:"cover"},{name:"Обложка с фото",value:"photo-cover"},{name:"Мысль",value:"statement"},{name:"Список",value:"list"},{name:"Шаги",value:"steps"},{name:"Число",value:"number"},{name:"Пол-на-пол",value:"split"},{name:"Фото-пример",value:"photo-example"},{name:"Призыв",value:"cta"}];
const themeNames: Record<CarouselTheme, string> = { editorial: "Редакция", swiss: "Швейцарский", film: "Плёнка", notebook: "Блокнот", contrast: "Контраст" };
const themes = Object.keys(themeNames) as CarouselTheme[];

function ScaledSlide({ slide, scale, ...props }: { slide: CarouselSlideData; scale: number; theme: CarouselTheme; index: number; total: number; handle: string; safeZone?: boolean; selectedField?: string | null; onSelectField?: (field: string) => void; onSelectSlide?: () => void }) {
  return <div className="cs-scaled" style={{ width: 1080 * scale, height: 1350 * scale }}><div style={{ width:1080,height:1350,transform:`scale(${scale})`,transformOrigin:"top left" }}><CarouselSlide slide={slide} {...props}/></div></div>;
}

export default function CarouselStudio() {
  const [slides, setSlides] = useState(initialSlides);
  const [active, setActive] = useState(0);
  const [mode, setMode] = useState<Mode>("slide");
  const [theme, setTheme] = useState<CarouselTheme>("editorial");
  const [safeZone, setSafeZone] = useState(false);
  const [inspector, setInspector] = useState<Inspector>("carousel");
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [sheet, setSheet] = useState<Sheet>(null);
  const [preview, setPreview] = useState(false);
  const [download, setDownload] = useState(false);
  const [demo, setDemo] = useState<DemoState>("updated");
  const [handle, setHandle] = useState("@anna.move");
  const [caption, setCaption] = useState("Три ошибки, из-за которых привычка не переживает февраль — и простой способ вернуться без чувства вины.");
  const [dragged, setDragged] = useState<number | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const current = slides[active];
  const selectField = (field: string) => { setSelectedField(field); setInspector("text"); if (window.innerWidth <= 640) setSheet("text"); };
  const selectSlide = () => { setSelectedField(null); setInspector("slide"); };
  const resetSelection = () => { setSelectedField(null); setInspector("carousel"); };
  const move = (to: number) => { if (dragged === null || dragged === to) return; setSlides(items => { const copy=[...items]; const [item]=copy.splice(dragged,1); copy.splice(to,0,item); return copy; }); setActive(to); setDragged(null); };
  const duplicate = () => setSlides(items => [...items.slice(0,active+1), {...current,id:Date.now()}, ...items.slice(active+1)]);
  const remove = () => { if(slides.length < 2) return; setSlides(items=>items.filter((_,i)=>i!==active)); setActive(Math.max(0,active-1)); };
  const scrollTo = (index: number) => { setActive(index); trackRef.current?.children[index]?.scrollIntoView({behavior:"smooth",inline:"center",block:"nearest"}); };
  if (demo !== "ready" && demo !== "updated") return <EmptyState state={demo} setState={setDemo}/>;

  return <section className="cs" onClick={event=>{if(event.target===event.currentTarget)resetSelection()}}>
    <button className="cs-demo" aria-label="Состояния демо" onClick={()=>setDemo(demo==="updated"?"ready":"updated")}><Sparkles/></button>
    <header className="cs-toolbar">
      <div className="cs-segment"><button className={mode==="slide"?"active":""} onClick={()=>setMode("slide")}>Слайд</button><button className={mode==="overview"?"active":""} onClick={()=>setMode("overview")}>Обзор</button></div>
      <div className="cs-pager"><button disabled={active===0} onClick={()=>setActive(active-1)}><ChevronLeft/></button><span>{active+1} / {slides.length}</span><button disabled={active===slides.length-1} onClick={()=>setActive(active+1)}><ChevronRight/></button></div>
      <div className="cs-toolbar-actions"><button onClick={()=>setPreview(true)}><Eye/>Как в Instagram</button><button className="primary" onClick={()=>setDownload(v=>!v)}><Download/>Скачать</button></div>
      {download&&<div className="cs-download-pop"><b>{slides.length} слайдов</b><button>Лента 4:5</button><button>Сторис 9:16</button><button>Видео для Reels <small>3 с на слайд · плавный сдвиг</small></button><button><Copy/>Скопировать подпись</button><button className="primary" onClick={()=>setDownload(false)}><Download/>Скачать</button></div>}
    </header>
    {demo==="updated"&&<div className="cs-updated">Сценарий обновился — собрать заново?<button onClick={()=>setDemo("ready")}>Собрать</button></div>}

    {mode==="slide" ? <div className="cs-workspace">
      <aside className="cs-rail"><div>{slides.map((slide,index)=><button key={slide.id} className={index===active?"active":""} draggable onDragStart={()=>setDragged(index)} onDragOver={e=>e.preventDefault()} onDrop={()=>move(index)} onClick={()=>scrollTo(index)}><span>{index+1}</span><GripVertical/><ScaledSlide slide={slide} scale={.088} theme={theme} index={index} total={slides.length} handle={handle}/></button>)}</div><button className="cs-add"><Plus/></button></aside>
      <main className="cs-stage" onClick={event=>{if(event.target===event.currentTarget)resetSelection()}}><div className="cs-desktop-art"><ScaledSlide slide={current} scale={.42} theme={theme} index={active} total={slides.length} handle={handle} safeZone={safeZone} selectedField={selectedField} onSelectField={selectField} onSelectSlide={selectSlide}/></div><div className="cs-mobile-track" ref={trackRef} onScroll={e=>{const w=(e.currentTarget.firstElementChild as HTMLElement)?.offsetWidth||1;setActive(Math.round(e.currentTarget.scrollLeft/(w+12)))}}>{slides.map((slide,index)=><div className="cs-mobile-art" key={slide.id}><ScaledSlide slide={slide} scale={.32} theme={theme} index={index} total={slides.length} handle={handle} selectedField={index===active?selectedField:null} onSelectField={selectField} onSelectSlide={selectSlide}/></div>)}</div><MobileThumbs slides={slides} active={active} theme={theme} handle={handle} onSelect={scrollTo}/></main>
      <InspectorPanel inspector={inspector} current={current} theme={theme} setTheme={setTheme} handle={handle} setHandle={setHandle} caption={caption} setCaption={setCaption} selectedField={selectedField} setSlides={setSlides} active={active} duplicate={duplicate} remove={remove} safeZone={safeZone} setSafeZone={setSafeZone}/>
      <nav className="cs-mobile-actions">{inspector==="slide"?<><button onClick={()=>setSheet("layout")}><LayoutGrid/>Макет</button><button onClick={duplicate}><Copy/>Дублировать</button><button onClick={remove}><Trash2/>Удалить</button><button onClick={resetSelection}><Check/>Готово</button></>:<><button onClick={()=>setSheet("theme")}><Palette/>Тема</button><button onClick={()=>setSheet("caption")}><Type/>Подпись</button><button onClick={()=>setPreview(true)}><Eye/>Instagram</button><button onClick={()=>setSheet("share")}><Share2/>Скачать</button></>}</nav>
    </div> : <Overview slides={slides} theme={theme} handle={handle} active={active} setActive={setActive} setMode={setMode} dragged={dragged} setDragged={setDragged} move={move}/>}
    {preview&&<InstagramPreview slides={slides} theme={theme} handle={handle} caption={caption} onClose={()=>setPreview(false)}/>}
    {sheet&&<MobileSheet sheet={sheet} onClose={()=>setSheet(null)} current={current} theme={theme} setTheme={setTheme} caption={caption} setCaption={setCaption} setSlides={setSlides} active={active}/>}
  </section>;
}

function MobileThumbs({slides,active,theme,handle,onSelect}:{slides:CarouselSlideData[];active:number;theme:CarouselTheme;handle:string;onSelect:(i:number)=>void}){return <div className="cs-mobile-thumbs">{slides.map((slide,i)=><button className={i===active?"active":""} onClick={()=>onSelect(i)} key={slide.id}><ScaledSlide slide={slide} scale={.0326} theme={theme} index={i} total={slides.length} handle={handle}/></button>)}</div>}
function InspectorPanel({inspector,current,theme,setTheme,handle,setHandle,caption,setCaption,selectedField,setSlides,active,duplicate,remove,safeZone,setSafeZone}:any){const update=(patch:Partial<CarouselSlideData>)=>setSlides((items:CarouselSlideData[])=>items.map((s,i)=>i===active?{...s,...patch}:s));return <aside className="cs-inspector"><div className="cs-inspector-head"><span>{inspector==="carousel"?"Карусель":inspector==="slide"?"Слайд":"Текст"}</span></div>{inspector==="carousel"?<><section><h3>Тема</h3><div className="cs-themes">{themes.map(t=><button className={theme===t?"active":""} onClick={()=>setTheme(t)} key={t}><i style={{background:carouselThemeStyles[t].background,color:carouselThemeStyles[t].text}}><b>Почему вы<br/>бросаете спорт</b><em>→</em></i><span>{themeNames[t]}</span></button>)}</div></section><section><h3>Просмотр</h3><label className="cs-check"><input type="checkbox" checked={safeZone} onChange={e=>setSafeZone(e.target.checked)}/>Безопасная зона</label></section><section><h3>Автор</h3><label className="cs-author"><span>А</span><input value={handle} onChange={e=>setHandle(e.target.value)}/></label><label className="cs-check"><input type="checkbox"/>Сделать по умолчанию</label></section><section><h3>Подпись к посту</h3><textarea value={caption} maxLength={2200} onChange={e=>setCaption(e.target.value)}/><small>{caption.length}/2200</small><div className="cs-chips"><button><Copy/>Копировать</button><button><Sparkles/>Переписать</button></div></section></>:inspector==="slide"?<><section><h3>Макет</h3><div className="cs-layouts">{layouts.map(l=><button className={current.layout===l.value?"active":""} onClick={()=>update({layout:l.value})} key={l.value}><i><span/><span/><span/></i><small>{l.name}</small></button>)}</div></section><section><h3>Фон</h3><div className="cs-segment wide"><button className="active">Как тема</button><button>Акцент</button></div></section><div className="cs-inspector-buttons"><button onClick={duplicate}><Copy/>Дублировать</button><button className="danger" onClick={remove}><Trash2/>Удалить</button></div></>:<TextControls value={selectedField==="body"?current.body||"":current.title} onChange={(value:string)=>update(selectedField==="body"?{body:value}:{title:value})}/>}</aside>}
function TextControls({value,onChange}:{value:string;onChange:(v:string)=>void}){const long=value.length>60;return <section className="cs-text-controls"><h3>Текст</h3><textarea className={long?"long":""} value={value} onChange={e=>onChange(e.target.value)}/><small>{value.length}/60</small>{long&&<p>Длинно — сократить?</p>}<div className="cs-chips"><button><Sparkles/>Короче</button><button><Sparkles/>Другой вариант</button><button><Sparkles/>Проще</button></div></section>}
function Overview({slides,theme,handle,active,setActive,setMode,dragged,setDragged,move}:any){return <main className="cs-overview"><header>{slides.length} слайдов · ~35 секунд чтения</header><div>{slides.map((slide:CarouselSlideData,index:number)=><article key={slide.id} draggable onDragStart={()=>setDragged(index)} onDragOver={e=>e.preventDefault()} onDrop={()=>move(index)} onDoubleClick={()=>{setActive(index);setMode("slide")}}><span>{index+1}</span><button className={index===active?"active":""} onClick={()=>setActive(index)}><ScaledSlide slide={slide} scale={.19} theme={theme} index={index} total={slides.length} handle={handle}/></button>{index<slides.length-1&&<ChevronRight className="cs-connector"/>}</article>)}<button className="cs-overview-add"><Plus/>Слайд</button></div></main>}
function InstagramPreview({slides,theme,handle,caption,onClose}:{slides:CarouselSlideData[];theme:CarouselTheme;handle:string;caption:string;onClose:()=>void}){const [index,setIndex]=useState(0);return <div className="cs-modal" onMouseDown={e=>{if(e.target===e.currentTarget)onClose()}}><section role="dialog" aria-modal="true" aria-labelledby="instagram-title" className="cs-instagram"><header><h2 id="instagram-title">Как в Instagram</h2><button onClick={onClose} aria-label="Закрыть"><X/></button></header><div className="cs-phone"><div className="ig-user"><span>А</span><b>{handle}</b><MoreHorizontal/></div><button className="ig-slide" onClick={()=>setIndex((index+1)%slides.length)}><ScaledSlide slide={slides[index]} scale={.274} theme={theme} index={index} total={slides.length} handle={handle}/></button><div className="ig-dots">{slides.map((_,i)=><i className={i===index?"active":""} key={i}/>)}</div><p><b>{handle}</b> {caption.slice(0,62)}… <span>ещё</span></p></div><div className="cs-profile"><div><b>{handle}</b><span>164 публикации</span></div><div className="profile-grid"><ScaledSlide slide={slides[0]} scale={.18} theme={theme} index={0} total={slides.length} handle={handle}/></div><p>Так обложка выглядит в профиле</p></div></section></div>}
function MobileSheet({sheet,onClose,current,theme,setTheme,caption,setCaption,setSlides,active}:any){const update=(patch:Partial<CarouselSlideData>)=>setSlides((items:CarouselSlideData[])=>items.map((s,i)=>i===active?{...s,...patch}:s));return <div className="cs-sheet-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)onClose()}}><section className="cs-sheet" role="dialog" aria-modal="true" aria-labelledby="sheet-title"><button className="cs-grabber" onClick={onClose} aria-label="Закрыть"/><h2 id="sheet-title">{sheet==="text"?"Текст":sheet==="share"?"Поделиться":sheet==="caption"?"Подпись":sheet==="layout"?"Макет":"Тема"}</h2>{sheet==="text"&&<TextControls value={current.title} onChange={(title)=>update({title})}/>} {sheet==="theme"&&<div className="cs-sheet-list">{themes.map(t=><button onClick={()=>{setTheme(t);onClose()}} key={t}><i style={{background:carouselThemeStyles[t].background}}/>{themeNames[t]}{theme===t&&<Check/>}</button>)}</div>} {sheet==="caption"&&<textarea value={caption} onChange={e=>setCaption(e.target.value)}/>} {sheet==="layout"&&<div className="cs-sheet-layouts">{layouts.map(l=><button onClick={()=>{update({layout:l.value});onClose()}} key={l.value}><LayoutGrid/>{l.name}</button>)}</div>} {sheet==="share"&&<div className="cs-share"><button><ImageIcon/>Сохранить 7 изображений</button><button><Share2/>Instagram</button><button><MoreHorizontal/>Ещё</button></div>}</section></div>}
function EmptyState({state,setState}:{state:DemoState;setState:(s:DemoState)=>void}){if(state==="building")return <section className="cs cs-empty"><div className="cs-skeletons">{[1,2,3].map(i=><i key={i}/>)}</div><h2>Раскладываю мысль по слайдам…</h2></section>;const copy=state==="no-script"?["Карусель собирается из сценария","К сценарию"]:state==="empty"?["Соберу 6–9 слайдов из сценария","Собрать карусель"]:["Не удалось собрать карусель","Повторить"];return <section className="cs cs-empty"><Sparkles/><h2>{copy[0]}</h2><button className="primary" onClick={()=>setState(state==="no-script"?"empty":state==="error"?"building":"ready")}>{copy[1]}</button></section>}
