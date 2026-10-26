"use client";

import { useRef, type Dispatch, type SetStateAction } from "react";
import { Camera, ChevronRight, Plus } from "lucide-react";
import { TODAY, addDays, dayLabelFull, dayOfMonth, mondayOf, parseDay, plural, weekdayShort, type Card, type OutputId } from "./data";
import { ReelCard } from "./ReelCard";
import { PIPELINE_COLUMNS, computeCard, missingShots, pipelineColumn, type CardAction, type StageName } from "./stage";

/** Everything a view needs from the Calendar: data with the plan applied, and the handlers. */
export type Ctx = {
  desktop: boolean;
  thoughts: Card[];
  open: (id: OutputId) => void;
  act: (thought: Card, action: CardAction) => void;
  askDay: (id: OutputId) => void;
  askThought: (day: string) => void;
  openShoot: (thought: Card) => void;
  isSlotDay: (day: string) => boolean;
  drag: OutputId | null;
  setDrag: (id: OutputId | null) => void;
  drop: (day: string) => void;
  selected: string;
  setSelected: (day: string) => void;
};

const WEEKDAY_LETTER = ["П", "В", "С", "Ч", "П", "С", "В"];
const daysFromToday = (day: string) => Math.round((parseDay(day).getTime() - parseDay(TODAY).getTime()) / 86400000);
const when = (day: string) => {
  const n = daysFromToday(day);
  return n === 0 ? "сегодня" : n === 1 ? "завтра" : `${weekdayShort(day)}, через ${n} ${plural(n, ["день", "дня", "дней"])}`;
};

const releasesOn = (ctx: Ctx, day: string) => ctx.thoughts.filter((t) => t.publishDate === day);
/** Thoughts whose shooting is planned on this day and still has missing shots. */
const shootsOn = (ctx: Ctx, day: string) => ctx.thoughts.filter((t) => t.shoot === day && missingShots(t) > 0);

function ShootPill({ ctx, day }: { ctx: Ctx; day: string }) {
  const list = shootsOn(ctx, day);
  if (list.length === 0) return null;
  const missing = list.reduce((sum, t) => sum + missingShots(t), 0);
  return <button type="button" className="cal-shoot-pill" onClick={() => ctx.openShoot(list[0])}><Camera />Съёмка · {missing} {plural(missing, ["кадр", "кадра", "кадров"])}</button>;
}

/** What one day holds. Shared by the week board column, the narrow day list and the month's selected day. */
function DayContent({ ctx, day, variant }: { ctx: Ctx; day: string; variant: "compact" | "row" }) {
  const list = releasesOn(ctx, day);
  const slot = ctx.isSlotDay(day) && list.length === 0 && day >= TODAY;
  return (
    <>
      <ShootPill ctx={ctx} day={day} />
      {list.map((t) => (
        <ReelCard key={t.id} thought={t} info={computeCard(t)} variant={variant} onOpen={() => ctx.open(t.id)} onAction={(a) => ctx.act(t, a)}
          dragging={ctx.drag === t.id} onDragStart={ctx.desktop ? () => ctx.setDrag(t.id) : undefined} onDragEnd={() => ctx.setDrag(null)} />
      ))}
      {slot && <button type="button" className="cal-slot" onClick={() => ctx.askThought(day)}><Plus />Свободно</button>}
    </>
  );
}

/** "Сегодня": what comes out in the next days and the next shooting day. A block on top of the week, not a section. */
export function TodayBlock({ ctx }: { ctx: Ctx }) {
  const horizon = addDays(TODAY, 2);
  const outgoing = ctx.thoughts.filter((t) => t.publishDate && !t.publishedAt && t.publishDate >= TODAY && t.publishDate <= horizon).sort((a, b) => (a.publishDate! < b.publishDate! ? -1 : 1));
  const shootDay = ctx.thoughts.filter((t) => t.shoot && t.shoot >= TODAY && missingShots(t) > 0).map((t) => t.shoot!).sort()[0];
  const shooting = shootDay ? shootsOn(ctx, shootDay) : [];
  const missing = shooting.reduce((sum, t) => sum + missingShots(t), 0);
  return (
    <section className="cal-today" aria-label="Сегодня">
      <h2>Сегодня <span>{dayLabelFull(TODAY)}</span></h2>
      <div className="cal-today-grid">
        <div className="cal-group">
          <header><h3>Выходит</h3></header>
          {outgoing.length === 0 ? <p className="cal-empty">В ближайшие дни ничего не выходит</p> : outgoing.map((t) => (
            <ReelCard key={t.id} thought={t} info={computeCard(t)} variant="row" when={when(t.publishDate!)} onOpen={() => ctx.open(t.id)} onAction={(a) => ctx.act(t, a)} />
          ))}
        </div>
        <div className="cal-group">
          <header><h3>Снять</h3></header>
          {shooting.length === 0 ? <p className="cal-empty">Съёмок пока нет</p> : (
            <button type="button" className="cal-shoot-banner" onClick={() => ctx.openShoot(shooting[0])}>
              <Camera />
              <span><strong>{dayLabelFull(shootDay)}</strong><small>Нет {missing} {plural(missing, ["кадра", "кадров", "кадров"])} · {shooting.map((t) => t.title).join(", ")}</small></span>
              <em>Открыть <ChevronRight /></em>
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

export function WeekView({ ctx, weekStart }: { ctx: Ctx; weekStart: string }) {
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const releases = days.reduce((n, d) => n + releasesOn(ctx, d).length, 0);
  const shoots = days.filter((d) => shootsOn(ctx, d).length > 0).length;
  const first = parseDay(days[0]); const last = parseDay(days[6]);
  const range = `${first.getDate()}–${last.getDate()} ${["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"][last.getMonth()]}`;
  return (
    <section className="cal-plan">
      <div className="cal-section-title"><div><h2>План</h2><span>{range}</span></div><span>{releases} {plural(releases, ["выход", "выхода", "выходов"])} · {shoots} {plural(shoots, ["съёмка", "съёмки", "съёмок"])}</span></div>
      {ctx.desktop ? (
        <div className="cal-week">
          {days.map((day) => (
            <div key={day} className={`cal-day ${ctx.drag ? "drop-ready" : ""}`} onDragOver={(event) => event.preventDefault()} onDrop={() => ctx.drop(day)}>
              <header><span>{weekdayShort(day)}</span><b className={day === TODAY ? "today" : ""}>{dayOfMonth(day)}</b></header>
              <DayContent ctx={ctx} day={day} variant="compact" />
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="cal-strip">
            {days.map((day, i) => (
              <button type="button" key={day} className={`${day === TODAY ? "today" : ""} ${day === ctx.selected && day !== TODAY ? "selected" : ""}`} onClick={() => ctx.setSelected(day)} aria-label={dayLabelFull(day)}>
                <span>{WEEKDAY_LETTER[i]}</span><b>{dayOfMonth(day)}</b>
                <i>{releasesOn(ctx, day).length > 0 && <em className="release" />}{shootsOn(ctx, day).length > 0 && <em className="shoot" />}{ctx.isSlotDay(day) && releasesOn(ctx, day).length === 0 && day >= TODAY && <em className="slot" />}</i>
              </button>
            ))}
          </div>
          <div className="cal-daylist">
            <h3>{dayLabelFull(ctx.selected)}</h3>
            <DayContent ctx={ctx} day={ctx.selected} variant="row" />
            {releasesOn(ctx, ctx.selected).length === 0 && shootsOn(ctx, ctx.selected).length === 0 && !(ctx.isSlotDay(ctx.selected) && ctx.selected >= TODAY) && <p className="cal-empty">На этот день ничего не запланировано</p>}
          </div>
        </>
      )}
    </section>
  );
}

export function Undated({ ctx }: { ctx: Ctx }) {
  const list = ctx.thoughts.filter((t) => !t.publishDate && !t.publishedAt);
  return (
    <section className="cal-undated">
      <header><h2>Без даты <span>· {list.length}</span></h2>{ctx.desktop && <small>Перетащите на день</small>}</header>
      {list.length === 0 ? <p className="cal-empty">У всех мыслей есть дата</p> : (
        <div className="cal-undated-list">
          {list.map((t) => (
            <ReelCard key={t.id} thought={t} info={computeCard(t)} variant={ctx.desktop ? "card" : "row"} onOpen={() => ctx.open(t.id)} onAction={(a) => ctx.act(t, a)}
              actionOverride={{ label: "На день…", onClick: () => ctx.askDay(t.id) }}
              dragging={ctx.drag === t.id} onDragStart={ctx.desktop ? () => ctx.setDrag(t.id) : undefined} onDragEnd={() => ctx.setDrag(null)} />
          ))}
        </div>
      )}
    </section>
  );
}

export function MonthView({ ctx, anchor }: { ctx: Ctx; anchor: string }) {
  const gridStart = mondayOf(anchor);
  const cells = Array.from({ length: 35 }, (_, i) => addDays(gridStart, i));
  const month = parseDay(anchor).getMonth();
  return (
    <section className="cal-plan">
      <div className="cal-month">
        <div className="cal-month-weekdays">{["пн", "вт", "ср", "чт", "пт", "сб", "вс"].map((x) => <span key={x}>{x}</span>)}</div>
        <div className="cal-month-grid">
          {cells.map((day) => {
            const list = releasesOn(ctx, day);
            const shoot = shootsOn(ctx, day).length > 0;
            const slot = ctx.isSlotDay(day) && list.length === 0 && day >= TODAY && parseDay(day).getMonth() === month;
            return (
              <div key={day} className={`${parseDay(day).getMonth() === month ? "" : "adjacent"} ${day === TODAY ? "today" : ""} ${day === ctx.selected ? "selected" : ""}`}
                onClick={() => ctx.setSelected(day)}>
                <b>{dayOfMonth(day)}</b>
                {shoot && <button type="button" className="cal-month-shoot" aria-label="Съёмка" onClick={(event) => { event.stopPropagation(); ctx.openShoot(shootsOn(ctx, day)[0]); }}><Camera /><span>Съёмка</span></button>}
                {list.map((t) => <button type="button" key={t.id} className="cal-month-thought" onClick={(event) => { event.stopPropagation(); ctx.open(t.id); }}><img src={t.cover} alt="" /><span>{t.title}</span></button>)}
                {slot && <button type="button" className="cal-month-slot" aria-label="Свободно" onClick={(event) => { event.stopPropagation(); ctx.askThought(day); }}><Plus /><span>Свободно</span></button>}
              </div>
            );
          })}
        </div>
      </div>
      {!ctx.desktop && (
        <div className="cal-daylist">
          <h3>{dayLabelFull(ctx.selected)}</h3>
          <DayContent ctx={ctx} day={ctx.selected} variant="row" />
        </div>
      )}
    </section>
  );
}

const COLUMN_LABEL: Record<StageName, string> = { Мысль: "Мысль", Сценарий: "Сценарий", Монтаж: "Монтаж", Съёмка: "Съёмка", Слайды: "Монтаж", Выход: "Выход" };

export function PipelineView({ ctx, active, setActive }: { ctx: Ctx; active: number; setActive: Dispatch<SetStateAction<number>> }) {
  const touch = useRef(0);
  const groups = PIPELINE_COLUMNS.map((column) => ({ column, list: ctx.thoughts.filter((t) => pipelineColumn(computeCard(t).stage) === column) }));
  return (
    <section className="cal-pipeline">
      <div className="cal-stage-chips">{groups.map((g, i) => <button type="button" key={g.column} className={active === i ? "active" : ""} onClick={() => setActive(i)}>{COLUMN_LABEL[g.column]} {g.list.length}</button>)}</div>
      <div className="cal-pipeline-board"
        onTouchStart={(event) => { touch.current = event.touches[0].clientX; }}
        onTouchEnd={(event) => { const delta = event.changedTouches[0].clientX - touch.current; if (Math.abs(delta) > 45) setActive((v) => Math.max(0, Math.min(groups.length - 1, v + (delta < 0 ? 1 : -1)))); }}>
        {groups.map((g, i) => (
          <div key={g.column} className={`cal-pipeline-column ${active === i ? "mobile-active" : ""}`}>
            <header><b>{COLUMN_LABEL[g.column]}</b><span>{g.list.length}</span></header>
            {g.list.length === 0 && <p className="cal-empty">Пусто</p>}
            {g.list.map((t) => <ReelCard key={t.id} thought={t} info={computeCard(t)} variant="card" onOpen={() => ctx.open(t.id)} onAction={(a) => ctx.act(t, a)} />)}
          </div>
        ))}
      </div>
    </section>
  );
}
