"use client";

import "./resource.css";

/** Mock: share of the period resource one script build takes. */
export const BUILD_COST = 8;
/** Mock conversion for the hint: 72% of the period is roughly 45 thoughts. */
const THOUGHTS_PER_PERCENT = 45 / 72;

export type ResourceLevel = "ok" | "low" | "critical" | "out";

export const resourceLevel = (percent: number): ResourceLevel =>
  percent <= 0 ? "out" : percent <= 5 ? "critical" : percent <= 20 ? "low" : "ok";

export const thoughtsLeft = (percent: number) => Math.max(1, Math.round(percent * THOUGHTS_PER_PERCENT));

export const pluralThoughts = (count: number) => {
  const tail = count % 100;
  if (tail >= 11 && tail <= 14) return "мыслей";
  const last = count % 10;
  if (last === 1) return "мысль";
  return last >= 2 && last <= 4 ? "мысли" : "мыслей";
};

/** "Ресурс на период: N%" with a progress bar; amber at <=20%, red at <=5%. */
export function ResourceMeter({ percent, compact = false }: { percent: number; compact?: boolean }) {
  const level = resourceLevel(percent);
  const left = thoughtsLeft(percent);
  return (
    <div className={`resource-meter level-${level} ${compact ? "compact" : ""}`}>
      <strong>Ресурс на период: {percent}%</strong>
      <span role="progressbar" aria-label="Ресурс на период" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent}>
        <i style={{ width: `${percent}%` }} />
      </span>
      <small>{percent > 0 ? `≈ хватит ещё на ~${left} ${pluralThoughts(left)}` : "Продлите, чтобы продолжить"}</small>
    </div>
  );
}

/** Soft warning at 20% and a stronger one at 5%. */
export function ResourceNotice({ percent, onRenew, onClose }: { percent: number; onRenew?: () => void; onClose?: () => void }) {
  const critical = percent <= 5;
  return (
    <section className={`resource-notice ${critical ? "critical" : "low"}`} role="status">
      <p>Ресурс на период: {percent}%. Продлите, чтобы не прерываться</p>
      <div>
        <button className="flow-primary" onClick={onRenew}>Продлить</button>
        {!critical && onClose && <button className="flow-ghost" onClick={onClose}>Закрыть</button>}
      </div>
    </section>
  );
}
