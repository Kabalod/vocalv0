"use client";

import { useCallback, useMemo, useState } from "react";
import { CalendarRange, ChevronDown, ChevronLeft, ChevronRight, Lightbulb, Plus, UserRound } from "lucide-react";
import { useIsDesktop } from "../desktop-views";
import { THOUGHTS, TODAY, addDays, dayLabelFull, initialPlan, mondayOf, monthTitle, parseDay, iso, withPlan, type Plan, type ThoughtId } from "./data";
import { computeCard, STAGE_TAB, type CardAction, type StageName, type StudioTab } from "./stage";
import { DayPicker, Inspector, SlotPicker, useEscape } from "./overlays";
import { MonthView, PipelineView, TodayBlock, Undated, WeekView, type Ctx } from "./views";
import "./calendar.css";

export type { StudioTab } from "./stage";
type Mode = "week" | "month" | "pipeline";
const MODES: [Mode, string][] = [["week", "Неделя"], ["month", "Месяц"], ["pipeline", "Конвейер"]];
/** Preferred publishing weekdays (Date.getDay): the first `rhythm` of them are the slots of the week. */
const RHYTHM_ORDER = [3, 6, 0, 1, 4, 5, 2];

export type CalendarProps = {
  onThoughts: () => void;
  onProfile: () => void;
  onNew: () => void;
  /** Open a thought in the studio. `shoot` opens the montage tab in "На съёмку" mode. */
  onOpenStudio: (title: string, tab: StudioTab, options?: { shoot?: boolean }) => void;
};

export default function Calendar({ onThoughts, onProfile, onNew, onOpenStudio }: CalendarProps) {
  const desktop = useIsDesktop();
  const [mode, setMode] = useState<Mode>("week");
  const [plan, setPlan] = useState<Plan>(initialPlan);
  const [weekStart, setWeekStart] = useState(mondayOf(TODAY));
  const [monthAnchor, setMonthAnchor] = useState(`${TODAY.slice(0, 7)}-01`);
  const [selected, setSelected] = useState(TODAY);
  const [pipelineStage, setPipelineStage] = useState(0);
  const [rhythm, setRhythm] = useState(3);
  const [rhythmOpen, setRhythmOpen] = useState(false);
  const [inspector, setInspector] = useState<ThoughtId | null>(null);
  const [dayPicker, setDayPicker] = useState<ThoughtId | null>(null);
  const [slotDay, setSlotDay] = useState<string | null>(null);
  const [drag, setDrag] = useState<ThoughtId | null>(null);

  const thoughts = useMemo(() => THOUGHTS.map((t) => withPlan(t, plan)), [plan]);
  const byId = useCallback((id: ThoughtId) => thoughts.find((t) => t.id === id)!, [thoughts]);
  const isSlotDay = useCallback((day: string) => RHYTHM_ORDER.slice(0, rhythm).includes(parseDay(day).getDay()), [rhythm]);

  const setRelease = (id: ThoughtId, release?: string) => setPlan((p) => ({ ...p, [id]: { ...p[id], release } }));
  const closeTop = () => { if (dayPicker) setDayPicker(null); else if (slotDay) setSlotDay(null); else if (rhythmOpen) setRhythmOpen(false); else setInspector(null); };
  useEscape(closeTop, Boolean(dayPicker || slotDay || rhythmOpen || inspector));

  const openStudio = (title: string, tab: StudioTab, options?: { shoot?: boolean }) => { setInspector(null); onOpenStudio(title, tab, options); };
  const act = (thought: ReturnType<typeof byId>, action: CardAction) => {
    if (action.kind === "studio") openStudio(thought.title, action.tab);
    else if (action.kind === "shoot") openStudio(thought.title, "Монтаж", { shoot: true });
    else if (action.kind === "release") setPlan((p) => ({ ...p, [thought.id]: { ...p[thought.id], released: true } }));
  };

  const ctx: Ctx = {
    desktop, thoughts, selected, setSelected, drag, setDrag, isSlotDay,
    open: setInspector,
    act,
    askDay: setDayPicker,
    askThought: setSlotDay,
    openShoot: (thought) => openStudio(thought.title, "Монтаж", { shoot: true }),
    drop: (day) => { if (drag) { setRelease(drag, day); setDrag(null); } },
  };

  const step = (n: number) => {
    if (mode === "week") { const next = addDays(weekStart, 7 * n); setWeekStart(next); setSelected(next); }
    else if (mode === "month") { const d = parseDay(monthAnchor); d.setMonth(d.getMonth() + n, 1); setMonthAnchor(iso(d)); }
  };
  const goToday = () => { setWeekStart(mondayOf(TODAY)); setMonthAnchor(`${TODAY.slice(0, 7)}-01`); setSelected(TODAY); };

  const current = inspector ? byId(inspector) : null;
  const pickerThought = dayPicker ? byId(dayPicker) : null;

  const nav = [
    { label: "Мысли", Icon: Lightbulb, active: false, onClick: onThoughts },
    { label: "Календарь", Icon: CalendarRange, active: true, onClick: () => undefined },
    { label: "Профиль", Icon: UserRound, active: false, onClick: onProfile },
  ];

  return (
    <div className="cal-shell">
      {desktop && (
        <aside className="cal-sidebar">
          <div className="cal-brand">Vocal</div>
          <nav aria-label="Основная навигация">
            {nav.map(({ label, Icon, active, onClick }) => <button type="button" key={label} className={active ? "active" : ""} aria-current={active ? "page" : undefined} onClick={onClick}><Icon />{label}</button>)}
          </nav>
        </aside>
      )}
      <div className="cal-window">
        <header className="cal-toolbar">
          <strong>Календарь</strong>
          <button type="button" className="cal-new" aria-label="Новая мысль" onClick={onNew}><Plus /></button>
        </header>
        <main className="cal-main">
          <header className="cal-head">
            <div><h1>Календарь</h1><p>{mode === "month" ? monthTitle(monthAnchor) : dayLabelFull(TODAY)}</p></div>
            <div className="cal-controls">
              {mode !== "pipeline" && (
                <div className="cal-date-nav">
                  <button type="button" aria-label={mode === "week" ? "Предыдущая неделя" : "Предыдущий месяц"} onClick={() => step(-1)}><ChevronLeft /></button>
                  <button type="button" className="cal-today-btn" onClick={goToday}>Сегодня</button>
                  <button type="button" aria-label={mode === "week" ? "Следующая неделя" : "Следующий месяц"} onClick={() => step(1)}><ChevronRight /></button>
                </div>
              )}
              <div className="cal-segment" role="tablist" aria-label="Режим календаря">
                {MODES.map(([key, label]) => <button type="button" role="tab" aria-selected={mode === key} key={key} className={mode === key ? "active" : ""} onClick={() => setMode(key)}>{label}</button>)}
              </div>
              <span className="cal-anchor">
                <button type="button" className="cal-chip" aria-expanded={rhythmOpen} onClick={() => setRhythmOpen(!rhythmOpen)}>Ритм: {rhythm} в неделю <ChevronDown /></button>
                {rhythmOpen && (
                  <div className="cal-popup">
                    <p>Публикаций в неделю</p>
                    <div className="cal-rhythm">{[1, 2, 3, 4, 5, 6, 7].map((n) => <button type="button" key={n} className={n === rhythm ? "active" : ""} onClick={() => { setRhythm(n); setRhythmOpen(false); }}>{n}</button>)}</div>
                  </div>
                )}
              </span>
            </div>
          </header>
          {mode === "week" && <><TodayBlock ctx={ctx} /><WeekView ctx={ctx} weekStart={weekStart} /><Undated ctx={ctx} /></>}
          {mode === "month" && <><MonthView ctx={ctx} anchor={monthAnchor} /><Undated ctx={ctx} /></>}
          {mode === "pipeline" && <PipelineView ctx={ctx} active={pipelineStage} setActive={setPipelineStage} />}
        </main>
      </div>
      {!desktop && (
        <nav className="cal-tabs" aria-label="Основная навигация">
          {nav.map(({ label, Icon, active, onClick }) => <button type="button" key={label} className={active ? "active" : ""} aria-current={active ? "page" : undefined} onClick={onClick}><Icon /><span>{label}</span></button>)}
        </nav>
      )}
      {current && (
        <Inspector
          thought={current}
          info={computeCard(current)}
          onClose={() => setInspector(null)}
          onAction={(a) => act(current, a)}
          onStage={(stage: StageName) => (stage === "Съёмка" ? openStudio(current.title, "Монтаж", { shoot: true }) : openStudio(current.title, STAGE_TAB[stage]!))}
          onDate={() => setDayPicker(current.id)}
          onClear={() => setRelease(current.id, undefined)}
        />
      )}
      {pickerThought && <DayPicker thought={pickerThought} rhythmDay={isSlotDay} onPick={(day) => { setRelease(pickerThought.id, day); setDayPicker(null); }} onClear={() => { setRelease(pickerThought.id, undefined); setDayPicker(null); }} onClose={() => setDayPicker(null)} />}
      {slotDay && <SlotPicker day={slotDay} candidates={thoughts.filter((t) => !t.release && !t.released)} onPick={(id) => { setRelease(id, slotDay); setSlotDay(null); }} onClose={() => setSlotDay(null)} />}
    </div>
  );
}
