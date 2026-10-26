"use client";

import { useEffect, type ReactNode } from "react";
import { CalendarDays, Check, X } from "lucide-react";
import { TODAY, addDays, dayLabel, dayLabelFull, dayOfMonth, plural, weekdayShort, type Thought } from "./data";
import { FormatBadge } from "./ReelCard";
import { STAGE_TAB, type CardAction, type CardInfo, type StageName } from "./stage";

/** Escape closes the topmost overlay; the caller passes its close handler. */
export function useEscape(onEscape: () => void, active: boolean) {
  useEffect(() => {
    if (!active) return;
    const handler = (event: KeyboardEvent) => { if (event.key === "Escape") onEscape(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onEscape, active]);
}

/** A dialog on a wide screen, a bottom sheet on a narrow one (CSS decides). */
export function Sheet({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <div className="cal-sheet-wrap" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="cal-sheet" role="dialog" aria-modal="true" aria-label={title}>
        <i className="cal-sheet-grab" />
        <header><h2>{title}</h2><button type="button" aria-label="Закрыть" onClick={onClose}><X /></button></header>
        {children}
      </section>
    </div>
  );
}

/** Choose the release day of a thought: the next 14 days, rhythm days marked. */
export function DayPicker({ thought, rhythmDay, onPick, onClear, onClose }: { thought: Thought; rhythmDay: (day: string) => boolean; onPick: (day: string) => void; onClear: () => void; onClose: () => void }) {
  const days = Array.from({ length: 14 }, (_, i) => addDays(TODAY, i));
  return (
    <Sheet title={`На день · ${thought.title}`} onClose={onClose}>
      <div className="cal-day-grid">
        {days.map((day) => (
          <button type="button" key={day} className={`${rhythmDay(day) ? "rhythm" : ""} ${thought.release === day ? "selected" : ""}`} onClick={() => onPick(day)} aria-label={dayLabelFull(day)}>
            <span>{weekdayShort(day)}</span><b>{dayOfMonth(day)}</b>
          </button>
        ))}
      </div>
      <p className="cal-sheet-note">Фиолетовым отмечены слоты вашего ритма</p>
      {thought.release && <button type="button" className="cal-sheet-danger" onClick={onClear}>Убрать из плана</button>}
    </Sheet>
  );
}

/** Put one of the thoughts without a date on a free day. */
export function SlotPicker({ day, candidates, onPick, onClose }: { day: string; candidates: Thought[]; onPick: (id: Thought["id"]) => void; onClose: () => void }) {
  return (
    <Sheet title={`Свободно · ${dayLabelFull(day)}`} onClose={onClose}>
      {candidates.length === 0 ? <p className="cal-sheet-note">Нет мыслей без даты</p> : <p className="cal-sheet-note">Выберите мысль без даты</p>}
      <div className="cal-pick-list">
        {candidates.map((t) => (
          <button type="button" key={t.id} onClick={() => onPick(t.id)}>
            <img src={t.cover} alt="" /><span><strong>{t.title}</strong><small>{t.format}</small></span>
          </button>
        ))}
      </div>
    </Sheet>
  );
}

function stageMeta(thought: Thought, stage: StageName): string {
  const f = thought.facts;
  switch (stage) {
    case "Мысль": return f.openQuestions > 0 ? `${f.answers} ${plural(f.answers, ["ответ", "ответа", "ответов"])}, без ответа: ${f.openQuestions}` : `${f.answers} ${plural(f.answers, ["ответ", "ответа", "ответов"])}`;
    case "Сценарий": return f.scriptVersion !== null ? `Версия ${f.scriptVersion}` : "Сценария нет";
    case "Монтаж": return f.shotsTotal > 0 ? `${f.shotsTotal} ${plural(f.shotsTotal, ["кадр", "кадра", "кадров"])}: ${f.shotsHave} есть, ${f.shotsTotal - f.shotsHave} доснять` : "План кадров не собран";
    case "Съёмка": return thought.shoot ? dayLabel(thought.shoot) : "Не назначена";
    case "Слайды": return f.slides > 0 ? `${f.slides} ${plural(f.slides, ["слайд", "слайда", "слайдов"])}` : "Слайдов нет";
    case "Выход": return thought.released ? "Вышло" : thought.release ? dayLabel(thought.release) : "Не запланирован";
  }
}

/** The thought card opened from any mode: side panel on a wide screen, bottom sheet on a narrow one. */
export function Inspector({ thought, info, onClose, onAction, onStage, onDate, onClear }: {
  thought: Thought;
  info: CardInfo;
  onClose: () => void;
  onAction: (action: CardAction) => void;
  onStage: (stage: StageName) => void;
  onDate: () => void;
  onClear: () => void;
}) {
  return (
    <div className="cal-inspector-wrap" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <aside className="cal-inspector" role="dialog" aria-modal="false" aria-label={thought.title}>
        <i className="cal-sheet-grab" />
        <header><span>Мысль</span><button type="button" aria-label="Закрыть" onClick={onClose}><X /></button></header>
        <div className="cal-inspector-scroll">
          <div className="cal-inspector-summary">
            <img src={thought.cover} alt="" />
            <div>
              <h2>{thought.title}</h2>
              <FormatBadge format={thought.format} />
              <button type="button" className="cal-date-badge" onClick={onDate}><CalendarDays />{thought.release ? dayLabel(thought.release) : "Без даты"}</button>
            </div>
          </div>
          {thought.release && !thought.released && <button type="button" className="cal-remove" onClick={onClear}>Убрать из плана</button>}
          <ol className="cal-tracker">
            {info.stages.map((stage, i) => {
              const state = info.complete[i] ? "complete" : i === info.index ? "current" : "";
              const isAction = i === info.index && stage === info.stage;
              return (
                <li className={state} key={stage}>
                  <i>{info.complete[i] ? <Check /> : i + 1}</i>
                  <span><strong>{stage}</strong><small>{stageMeta(thought, stage)}</small></span>
                  {stage === "Выход" ? (isAction && info.action.kind === "release" ? <button type="button" className="primary" onClick={() => onAction(info.action)}>{info.action.label}</button> : null)
                    : stage === "Съёмка" ? <button type="button" onClick={() => onStage(stage)}>Снять ›</button>
                    : STAGE_TAB[stage] ? <button type="button" onClick={() => onStage(stage)}>{stage === "Слайды" ? "Слайды" : STAGE_TAB[stage]} ›</button> : null}
                </li>
              );
            })}
          </ol>
        </div>
      </aside>
    </div>
  );
}
