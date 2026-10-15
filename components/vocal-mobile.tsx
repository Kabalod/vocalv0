"use client";

import { useRef, useState } from "react";
import { Camera, Check, ChevronLeft, ChevronRight, Circle, Clapperboard, Copy, Download, FileText, GalleryHorizontal, GripVertical, Images, Lightbulb, MessageCircle, Mic, MoreHorizontal, Plus, Sparkles, Sun, SwitchCamera, Video, X } from "lucide-react";
import "./vocal-mobile.css";
import "./vocal-studio.css";

type StudioTab = "takes" | "dialog" | "script" | "montage" | "carousel";
type ScriptMode = "text" | "shots";
type ShootView = "overview" | "frame" | "done";

const frames = [
  { n: "01", label: "Хук", phrase: "Вы бросаете не спорт, а план", shot: "Крупный, смотрю в камеру", size: "Крупный", place: "Дома у окна", duration: "3 с", has: false },
  { n: "02", label: "Суть", phrase: "В январе мы берём план на человека, которым хотим стать", shot: "Средний, иду по улице", size: "Средний", place: "Улица", duration: "7 с", has: true, source: "Дорога в зал" },
  { n: "03", label: "Пример", phrase: "15 минут хватит", shot: "Деталь, таймер на телефоне", size: "Деталь", place: "Дома у окна", duration: "4 с", has: false },
  { n: "04", label: "Пример", phrase: "Утро без телефона", shot: "Общий, кофе на подоконнике", size: "Общий", place: "Дома у окна", duration: "6 с", has: true, source: "Кофе на подоконнике" },
  { n: "05", label: "Призыв", phrase: "Сохраните и напишите СТАРТ", shot: "Крупный, смотрю в камеру", size: "Крупный", place: "Улица", duration: "5 с", has: true, source: "Лучший дубль" },
];

export default function VocalMobile({ onProfile }: { onOpen: (title: string) => void; onProfile: () => void }) {
  const [tab, setTab] = useState("Сегодня");
  const [studio, setStudio] = useState(false);
  const [studioTab, setStudioTab] = useState<StudioTab>("dialog");
  const [scriptMode, setScriptMode] = useState<ScriptMode>("text");
  const [sheet, setSheet] = useState<string | null>(null);
  const [shoot, setShoot] = useState<ShootView | null>(null);
  const [camera, setCamera] = useState(false);
  const [selectedFrame, setSelectedFrame] = useState(0);
  const [done, setDone] = useState([1, 3]);
  const swipe = useRef(0);

  if (camera) return <Teleprompter onClose={() => setCamera(false)} />;
  if (shoot) return <ShootDay view={shoot} setView={setShoot} done={done} setDone={setDone} onClose={() => setShoot(null)} />;
  if (studio) return <Studio tab={studioTab} setTab={setStudioTab} mode={scriptMode} setMode={setScriptMode} sheet={sheet} setSheet={setSheet} setCamera={setCamera} setShoot={setShoot} selectedFrame={selectedFrame} setSelectedFrame={setSelectedFrame} onClose={() => setStudio(false)} swipe={swipe} />;

  return <div className="vm-app vm-home">
    <header className="vm-nav"><button className="vm-avatar" onClick={onProfile}>АМ</button><b>{tab}</b><button>Сегодня</button></header>
    <main className="vm-main">
      <div className="vm-heading"><h1>{tab}</h1><p>среда, 14 октября</p></div>
      {tab === "Сегодня" && <>
        <div className="vm-week">{[12,13,14,15,16,17,18].map((d,i)=><button key={d}><small>{"ПВСЧПСВ"[i]}</small><b className={d===14?"today":""}>{d}</b></button>)}</div>
        <section className="vm-section"><header><h2>Выходит</h2></header><ThoughtCard onClick={()=>setStudio(true)} /></section>
        <section className="vm-section"><header><h2>Снять</h2></header><button className="vm-shoot" onClick={()=>setShoot("overview")}><Camera/><span><b>Чт, 15 октября</b><small>8 кадров · 3 мысли · ≈25 мин</small></span><strong>Открыть</strong></button></section>
      </>}
      {tab === "Мысли" && <><div className="vm-chips"><button className="active">Все 16</button><button>Сценарий 3</button><button>Снимаю 2</button></div><section className="vm-section"><header><h2>Снимаю</h2></header><ThoughtCard onClick={()=>setStudio(true)} /></section></>}
      {tab === "Копилка" && <section className="vm-section"><header><h2>Не разобрано · 4</h2></header><div className="vm-photo-grid"><img src="/events/coffee.png" alt="Кофе на подоконнике"/><img src="/events/gym-road.png" alt="Дорога в зал"/></div></section>}
    </main>
    <nav className="vm-tabs"><button className={tab==="Сегодня"?"active":""} onClick={()=>setTab("Сегодня")}><Sun/><span>Сегодня</span></button><button className={tab==="Мысли"?"active":""} onClick={()=>setTab("Мысли")}><Lightbulb/><span>Мысли</span></button><button className="vm-record"><Mic/></button><button className={tab==="Копилка"?"active":""} onClick={()=>setTab("Копилка")}><Images/><span>Копилка</span></button></nav>
    {sheet && <Sheet title={sheet} onClose={()=>setSheet(null)}><p>Выберите дату выхода для мысли</p><div className="vm-mini-calendar">{Array.from({length:14},(_,i)=><button key={i}>{i+12}</button>)}</div></Sheet>}
  </div>;
}

function ThoughtCard({onClick}:{onClick:()=>void}){return <button className="vm-thought-card" onClick={onClick}><img src="/events/gym-road.png" alt=""/><span><b>Привычка и мотивация</b><small>Выйдет пт, 16 окт</small><em>Нет 2 кадров · съёмка в чт</em></span><ChevronRight/></button>}

function Studio({tab,setTab,mode,setMode,sheet,setSheet,setCamera,setShoot,selectedFrame,setSelectedFrame,onClose,swipe}:{tab:StudioTab;setTab:(s:StudioTab)=>void;mode:ScriptMode;setMode:(m:ScriptMode)=>void;sheet:string|null;setSheet:(s:string|null)=>void;setCamera:(v:boolean)=>void;setShoot:(v:ShootView|null)=>void;selectedFrame:number;setSelectedFrame:(n:number)=>void;onClose:()=>void;swipe:React.MutableRefObject<number>}){
 const tabs:{id:StudioTab;label:string;icon:typeof Video}[]=[
  {id:"takes",label:"Дубли",icon:Video},{id:"dialog",label:"Диалог",icon:MessageCircle},{id:"script",label:"Сценарий",icon:FileText},{id:"montage",label:"Монтаж",icon:Clapperboard},{id:"carousel",label:"Карусель",icon:GalleryHorizontal},
 ];
 const index=tabs.findIndex(item=>item.id===tab);
 const primary=tab==="dialog"?{label:"Улучшить сценарий",action:()=>setTab("script")}:tab==="script"?{label:"Собрать монтаж",action:()=>setTab("montage")}:tab==="montage"?{label:"Перейти к съёмке · 2 доснять",action:()=>setTab("takes")}:tab==="takes"?{label:"Записать с суфлёром",action:()=>setCamera(true)}:null;
 return <div className="vm-app vm-studio"><header className="vm-studio-nav"><button onClick={onClose}><ChevronLeft/> Мысли</button><button aria-label="Меню мысли" onClick={()=>setSheet("Действия с мыслью")}><MoreHorizontal/></button></header>
 <main onTouchStart={e=>swipe.current=e.touches[0].clientX} onTouchEnd={e=>{const d=e.changedTouches[0].clientX-swipe.current;if(Math.abs(d)>70)setTab(tabs[Math.max(0,Math.min(tabs.length-1,index+(d<0?1:-1)))].id)}}>
  <header className="vm-studio-head"><h1 contentEditable suppressContentEditableWarning>Привычка и мотивация</h1><div className="vm-studio-meta"><button onClick={()=>setSheet("Дата выхода")}>Выйдет пт, 16 окт ›</button><button onClick={()=>setSheet("Формат мысли")}>Оба ⌄</button></div></header>
  <nav className="vm-studio-tabs" aria-label="Разделы мысли">{tabs.map(item=>{const Icon=item.icon;return <button className={item.id===tab?"active":""} onClick={()=>setTab(item.id)} key={item.id} aria-label={item.label}><Icon/><span>{item.label}</span></button>})}</nav>
  <div className="vm-step-content">{tab==="dialog"?<Speak/>:tab==="script"?<Script mode="text" setMode={setMode} setSheet={setSheet} selectedFrame={selectedFrame} setSelectedFrame={setSelectedFrame}/>:tab==="montage"?<Script mode="shots" setMode={setMode} setSheet={setSheet} selectedFrame={selectedFrame} setSelectedFrame={setSelectedFrame}/>:tab==="takes"?<Film setShoot={setShoot}/>:<CarouselEditor setSheet={setSheet}/>}</div>
 </main>
 {primary&&<div className="vm-sticky-action"><button onClick={primary.action}>{primary.label}</button>{tab==="dialog"&&<small>Новые ответы войдут в следующую версию</small>}</div>}
 {sheet && <Sheet title={sheet} onClose={()=>setSheet(null)}>{sheet.startsWith("Кадр") ? <FrameSheet frame={frames[selectedFrame]} /> : sheet.includes("Дата") ? <><p>Свободные слоты ритма подсвечены</p><div className="vm-mini-calendar">{Array.from({length:14},(_,i)=><button className={i===5?"free":""} key={i}>{i+12}</button>)}</div></> : sheet.includes("Формат") ? <div className="vm-sheet-actions"><button>Рилс</button><button>Карусель</button><button className="selected-format">Оба <span>✦ предложено</span></button></div> : sheet.includes("Подпись") ? <CaptionSheet/> : sheet.includes("Поделиться") ? <div className="vm-sheet-actions"><button><Download/> Сохранить 7 изображений</button><button><Images/> Instagram</button><button><MoreHorizontal/> Ещё</button></div> : <div className="vm-sheet-actions"><button>Переименовать</button><button>Дата выхода</button><button className="danger">Удалить</button></div>}</Sheet>}
 </div>
}

function FrameSheet({frame}:{frame:(typeof frames)[number]}){return <div className="vm-frame-sheet"><h3>{frame.phrase}</h3><label>Что в кадре<textarea defaultValue={frame.shot}/></label><label>Крупность</label><div className="vm-size-segment">{["Общий","Средний","Крупный","Деталь"].map(x=><button className={x===frame.size?"active":""} key={x}>{x}</button>)}</div><label>Место</label><div className="vm-reply-chips"><button>{frame.place}</button><button>Улица</button><button><Plus/></button></div><label>Текст на экране<input defaultValue={frame.label==="Призыв"?"СТАРТ":""} placeholder="Добавить текст"/></label><label>Источник</label><div className="vm-source-grid"><button><img src="/events/gym-road.png" alt="Дорога в зал"/><span>Дорога в зал</span></button><button><img src="/events/coffee.png" alt="Кофе на подоконнике"/><span>Утро</span></button><button className="reshoot"><Camera/><span>Доснять</span></button></div></div>}


function Speak(){return <section className="vm-dialog"><div className="vm-vocal-message">Что обычно ломает ваш план на третий день?</div><div className="vm-voice"><div className="vm-wave-mini">▂▅▃▇▅▂▆▃▅</div><time>0:24</time><details><summary>Расшифровка</summary><p>Я строю план для идеальной версии себя, а жить по нему приходится мне сегодняшней.</p></details></div><div className="vm-vocal-message">Какой самый маленький шаг всё-таки работает?</div><div className="vm-reply-chips"><button>Не помню</button><button>Пропустить вопрос</button></div><div className="vm-composer"><textarea aria-label="Ответ" placeholder="Ответьте текстом или голосом"/><button aria-label="Удерживайте, чтобы говорить"><Mic/></button></div></section>}

function Script({mode,setMode,setSheet,selectedFrame,setSelectedFrame}:{mode:ScriptMode;setMode:(m:ScriptMode)=>void;setSheet:(s:string|null)=>void;selectedFrame:number;setSelectedFrame:(n:number)=>void}){return <section className="vm-script"><div className="vm-segment"><button className={mode==="text"?"active":""} onClick={()=>setMode("text")}>Текст</button><button className={mode==="shots"?"active":""} onClick={()=>setMode("shots")}>Кадры</button></div>{mode==="text"?<><div className="vm-document">{frames.map(f=><article key={f.n}><small>{f.label}</small><p contentEditable suppressContentEditableWarning>{f.phrase}{f.n==="02"?". Мы ждём мотивацию, хотя привычке нужен не подвиг, а вход без сопротивления.":"."}</p></article>)}</div><button className="vm-link" onClick={()=>setSheet("Версии сценария")}>Версия 3 ›</button></>:<><div className="vm-video-types"><button className="active">Говорящая голова ✦</button><button>Голос за кадром</button><button>Шаги</button></div><div className="vm-duration"><span>27 / 30 с</span><i/></div><div className="vm-frame-list">{frames.map((f,i)=><button key={f.n} onClick={()=>{setSelectedFrame(i);setSheet("Кадр "+f.n)}}><div><small>{f.label}</small><h3>{f.phrase}</h3><p>В кадре: {f.shot.toLowerCase()}</p><span>{f.size}</span><time>{f.duration}</time></div>{f.has?<img src={i===3?"/events/coffee.png":"/events/gym-road.png"} alt={f.source}/>:<i className="vm-reshoot"><Camera/>Доснять</i>}</button>)}</div></>}<button className="vm-carousel-link">Сделать карусель ›</button>{selectedFrame>=0&&null}</section>}

function CarouselEditor({setSheet}:{setSheet:(s:string|null)=>void}){
 const [slide,setSlide]=useState(0);
 const [theme,setTheme]=useState<"graphite"|"paper"|"contrast">("graphite");
 const [panel,setPanel]=useState<"layout"|"theme"|"order"|null>(null);
 const slides=[
  {kicker:"ПРИВЫЧКА ≠ МОТИВАЦИЯ",title:"Вы бросаете не спорт, а план",body:"План для идеальной версии себя ломается о первый обычный день.",layout:"cover"},
  {kicker:"01",title:"Начните с входа",body:"Не час в зале. Пятнадцать минут, которые можно повторить завтра.",layout:"thought"},
  {kicker:"ПРОВЕРЬТЕ ПЛАН",title:"Он работает в плохой день?",body:"Если нет — уменьшите шаг, а не отменяйте движение.",layout:"quote"},
  {kicker:"02",title:"Ритм важнее рывка",body:"Маленькое действие сохраняет связь с привычкой.",layout:"number"},
  {kicker:"ПРИМЕР",title:"15 минут хватит",body:"Таймер. Один подход. Короткая прогулка. Этого достаточно.",layout:"list"},
  {kicker:"СОХРАНИТЕ",title:"План должен выдерживать жизнь",body:"Вернитесь к нему в день, когда мотивации не будет.",layout:"thought"},
  {kicker:"ВАШ ХОД",title:"Напишите СТАРТ",body:"И выберите действие, которое займёт не больше 15 минут.",layout:"cta"},
 ];
 const current=slides[slide];
 return <section className="vm-carousel-editor">
  <div className="vm-carousel-status"><span>Готово · 7 слайдов</span><button onClick={()=>setSheet("Подпись к посту")}>Подпись к посту ›</button></div>
  <div className="vm-artboard-window"><button className="vm-slide-arrow left" aria-label="Предыдущий слайд" disabled={slide===0} onClick={()=>setSlide(v=>v-1)}><ChevronLeft/></button><article className={`vm-artboard ${theme} ${current.layout}`}><small>{current.kicker}</small><h2>{current.title}</h2><p>{current.body}</p><footer><span>@vocal</span><b>{slide+1}/7</b></footer></article><button className="vm-slide-arrow right" aria-label="Следующий слайд" disabled={slide===6} onClick={()=>setSlide(v=>v+1)}><ChevronRight/></button></div>
  <div className="vm-carousel-pager"><span>{slide+1} / 7</span><div>{slides.map((_,i)=><button aria-label={`Слайд ${i+1}`} className={i===slide?"active":""} onClick={()=>setSlide(i)} key={i}/>)}</div></div>
  <button className="vm-caption-preview" onClick={()=>setSheet("Подпись к посту")}><span><b>Подпись к посту</b><small>Мотивация заканчивается. Ритм остаётся — если шаг достаточно мал…</small></span><Copy/></button>
  {panel&&<div className="vm-carousel-panel">{panel==="layout"?<><h3>Макет</h3><div className="vm-layout-grid">{["Обложка","Мысль","Список","Шаги","Цитата","Число","Призыв"].map((x,i)=><button className={i===slide%7?"active":""} key={x}><i/><span>{x}</span></button>)}</div></>:panel==="theme"?<><h3>Тема</h3><div className="vm-theme-grid"><button className={theme==="graphite"?"active graphite":"graphite"} onClick={()=>setTheme("graphite")}>Аа<span>Графит</span></button><button className={theme==="paper"?"active paper":"paper"} onClick={()=>setTheme("paper")}>Аа<span>Бумага</span></button><button className={theme==="contrast"?"active contrast":"contrast"} onClick={()=>setTheme("contrast")}>Аа<span>Контраст</span></button></div></>:<><h3>Порядок</h3><div className="vm-order-list">{slides.slice(0,4).map((s,i)=><div key={s.title}><GripVertical/><b>{i+1}</b><span>{s.title}</span></div>)}<button><Plus/> Слайд</button></div></>}</div>}
  <nav className="vm-carousel-tools"><button className={panel==="layout"?"active":""} onClick={()=>setPanel(panel==="layout"?null:"layout")}><GalleryHorizontal/><span>Макет</span></button><button className={panel==="theme"?"active":""} onClick={()=>setPanel(panel==="theme"?null:"theme")}><Sparkles/><span>Тема</span></button><button className={panel==="order"?"active":""} onClick={()=>setPanel(panel==="order"?null:"order")}><GripVertical/><span>Порядок</span></button><button onClick={()=>setSheet("Поделиться каруселью")}><Download/><span>Скачать</span></button></nav>
 </section>
}

function CaptionSheet(){return <div className="vm-caption-sheet"><textarea defaultValue={'Мотивация заканчивается. Ритм остаётся — если шаг достаточно мал, чтобы повторить его даже в плохой день.\n\nСохраните и напишите СТАРТ — выберем ваш минимальный шаг.'}/><div><span>164/2200</span><button><Copy/> Копировать</button></div></div>}

function Film({setShoot}:{setShoot:(v:ShootView|null)=>void}){return <section className="vm-film"><div className="vm-film-summary"><b>5 кадров</b><span>3 есть · 2 доснять</span></div><div className="vm-frame-strip">{frames.map((f,i)=>f.has?<img key={f.n} src={i===3?"/events/coffee.png":"/events/gym-road.png"} alt=""/>:<button key={f.n}><Camera/></button>)}</div><h2>Доснять</h2>{frames.filter(f=>!f.has).map(f=><div className="vm-todo-frame" key={f.n}><i>{f.size[0]}</i><span><b>{f.phrase}</b><small>{f.place}</small></span><button><Camera/></button></div>)}<h2>Съёмка</h2><button className="vm-schedule" onClick={()=>setShoot("overview")}>Чт, 15 октября <small>вместе с 2 другими мыслями</small><ChevronRight/></button><h2>Дубли</h2><div className="vm-takes"><div><img src="/events/gym-road.png" alt="Дубль"/><span>★ 0:18</span></div><div><img src="/events/coffee.png" alt="Дубль"/><span>0:21</span></div></div></section>}

function ShootDay({view,setView,done,setDone,onClose}:{view:ShootView;setView:(v:ShootView|null)=>void;done:number[];setDone:React.Dispatch<React.SetStateAction<number[]>>;onClose:()=>void}){const [frame,setFrame]=useState(2);if(view==="done")return <div className="vm-camera vm-finish"><Sparkles/><h1>Готово: 6 из 8</h1><p>2 мысли перешли в «Готово»</p><button className="vm-primary" onClick={onClose}>Закрыть</button></div>;if(view==="frame"){const f=frames[frame%5];return <div className="vm-camera vm-shot-step"><header><button onClick={()=>setView("overview")}><X/></button><span>Кадр {frame+1} из 8 · {f.place}</span></header><main><span className="vm-thought-tag">Привычка и мотивация</span><h1>{f.shot}</h1><blockquote>{f.phrase}</blockquote><div className="vm-framing">{f.size}</div></main><footer><button onClick={()=>setFrame(v=>v+1)}>Пропустить</button><button className="vm-shutter" onClick={()=>{setDone(v=>[...new Set([...v,frame])]);if(frame>=7)setView("done");else setFrame(v=>v+1)}}><span/></button><i/></footer></div>}
 return <div className="vm-app vm-shoot-day"><header className="vm-studio-nav"><button onClick={onClose}><ChevronLeft/> Сегодня</button><MoreHorizontal/></header><main><div className="vm-heading"><h1>Четверг,<br/>15 октября</h1><p>8 кадров · 3 мысли · ≈25 мин</p></div><div className="vm-shoot-progress"><span style={{width:`${done.length/8*100}%`}}/><small>{done.length} из 8 снято</small></div><section><h2>Взять с собой</h2>{["Штатив","Серая кофта","Белая кружка"].map((x,i)=><label key={x}><input type="checkbox" defaultChecked={i===0}/><span>{x}</span></label>)}<button className="vm-add"><Plus/> Добавить</button></section>{["Дома у окна","Улица"].map((place,pi)=><section key={place}><h2>{place} · 4</h2>{frames.filter((_,i)=>i%2===pi).map((f,i)=><div className="vm-shoot-row" key={f.n}><i>{f.size[0]}</i><span><b>{f.shot}</b><small><em>Привычка и мотивация</em> · {f.duration}</small></span><button onClick={()=>setDone(v=>v.includes(i)?v.filter(x=>x!==i):[...v,i])}>{done.includes(i)?<Check/>:<Circle/>}</button></div>)}</section>)}</main><div className="vm-sticky-action"><button onClick={()=>setView("frame")}>Начать съёмку</button></div></div>}

function Teleprompter({onClose}:{onClose:()=>void}){const [speed,setSpeed]=useState(45);const [recording,setRecording]=useState(false);return <div className="vm-camera vm-prompter"><img src="/events/gym-road.png" alt="Видоискатель"/><header><button onClick={onClose}><X/></button><span>Суфлёр</span><button><SwitchCamera/></button></header><div className="vm-prompt-text">Вы бросаете не спорт, а план.<br/><br/>В январе мы берём план на человека, которым хотим стать. Но пятнадцати минут уже хватит, чтобы не потерять ритм.</div><div className="vm-speed"><small>Скорость</small><input aria-label="Скорость суфлёра" type="range" value={speed} onChange={e=>setSpeed(+e.target.value)}/></div><button className={`vm-shutter ${recording?"recording":""}`} onClick={()=>setRecording(v=>!v)} aria-label="Запись"><span/></button></div>}

function Sheet({title,onClose,children}:{title:string;onClose:()=>void;children:React.ReactNode}){return <div className="vm-overlay" onClick={onClose}><section className="vm-sheet" role="dialog" aria-modal="true" aria-label={title} onClick={e=>e.stopPropagation()}><header><h2>{title}</h2><button onClick={onClose}>Готово</button></header><div>{children}</div></section></div>}
