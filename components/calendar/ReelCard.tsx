"use client";

import type { DragEvent, ReactNode } from "react";
import { AlertTriangle, Clapperboard, GalleryHorizontal } from "lucide-react";
import type { Card } from "./data";
import type { CardAction, CardInfo } from "./stage";

export type ReelCardVariant = "card" | "compact" | "row";

type Props = {
  thought: Card;
  info: CardInfo;
  /** card: cover beside the text (lists, pipeline). compact: cover on top (week board). row: small cover, one line (task groups, day lists). */
  variant?: ReelCardVariant;
  /** Extra line under the title ("сегодня", "пт, через 2 дня"). */
  when?: string;
  /** Replaces the computed action button, e.g. "На день…" for a thought without a date. */
  actionOverride?: { label: string; onClick: () => void };
  onOpen: () => void;
  onAction: (action: CardAction) => void;
  dragging?: boolean;
  onDragStart?: (event: DragEvent) => void;
  onDragEnd?: () => void;
};

export function StageBar({ info }: { info: CardInfo }) {
  return (
    <span className="cal-stagebar" role="img" aria-label={`Этап: ${info.stage}, ${info.index + 1} из ${info.stages.length}`}>
      {info.stages.map((name, i) => (
        <i key={name} title={name} className={info.complete[i] ? "done" : i === info.index ? "current" : ""} />
      ))}
    </span>
  );
}

export function FormatBadge({ format }: { format: Card["format"] }): ReactNode {
  const Icon = format === "Карусель" ? GalleryHorizontal : Clapperboard;
  return <span className="cal-format"><Icon />{format}</span>;
}

/** The single reel/thought card of the calendar: every mode and both layouts render it. Stage, blocker and action come from computeCard. */
export function ReelCard({ thought, info, variant = "card", when, actionOverride, onOpen, onAction, dragging, onDragStart, onDragEnd }: Props) {
  const warning = info.risk ?? info.blocker;
  const label = actionOverride?.label ?? info.action.label;
  const run = () => (actionOverride ? actionOverride.onClick() : onAction(info.action));
  const action = info.action.kind === "done" && !actionOverride
    ? <span className="cal-done">{label}</span>
    : <button type="button" className="cal-card-action" onClick={(event) => { event.stopPropagation(); run(); }}>{label}</button>;
  const draggable = Boolean(onDragStart);
  return (
    <article
      className={`cal-card cal-card-${variant} ${dragging ? "dragging" : ""}`}
      data-stage={info.stage}
      tabIndex={0}
      role="button"
      aria-label={thought.title}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onOpen}
      onKeyDown={(event) => { if (event.key === "Enter" && event.target === event.currentTarget) onOpen(); }}
    >
      <img src={thought.cover} alt="" />
      <div className="cal-card-copy">
        <h3>{thought.title}</h3>
        {variant === "row" ? <small>{when ?? thought.format}</small> : <FormatBadge format={thought.format} />}
        <StageBar info={info} />
        {warning && <span className="cal-blocker"><AlertTriangle />{warning}</span>}
        {info.risk && info.blocker && <span className="cal-blocker"><AlertTriangle />{info.blocker}</span>}
        {variant !== "row" && action}
      </div>
      {variant === "row" && action}
    </article>
  );
}
