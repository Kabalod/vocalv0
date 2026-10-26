// The stage of a thought, its blocker and its next action are never stored: they are computed from the facts in data.ts.
import { plural, weekdayShort, type Card } from "./data";

export type StageName = "Мысль" | "Сценарий" | "Монтаж" | "Съёмка" | "Слайды" | "Выход";
export type StudioTab = "Диалог" | "Сценарий" | "Монтаж" | "Карусель";

export const REEL_STAGES: readonly StageName[] = ["Мысль", "Сценарий", "Монтаж", "Съёмка", "Выход"];
export const CAROUSEL_STAGES: readonly StageName[] = ["Мысль", "Сценарий", "Слайды", "Выход"];
export const stagesFor = (format: Card["format"]) => (format === "Карусель" ? CAROUSEL_STAGES : REEL_STAGES);

/** The studio tab each stage lives in. "Съёмка" has no tab of its own: it opens the montage tab in shooting mode. */
export const STAGE_TAB: Partial<Record<StageName, StudioTab>> = { Мысль: "Диалог", Сценарий: "Сценарий", Монтаж: "Монтаж", Слайды: "Карусель" };

export type CardAction =
  | { kind: "studio"; label: string; tab: StudioTab }
  | { kind: "shoot"; label: string }
  | { kind: "release"; label: string }
  | { kind: "done"; label: string };

export type CardInfo = {
  stages: readonly StageName[];
  /** Index of the current stage: the first one that is not complete (the last one when everything is). */
  index: number;
  stage: StageName;
  complete: boolean[];
  blocker?: string;
  /** Shooting is planned after the release day. */
  risk?: string;
  action: CardAction;
};

export function isStageComplete(thought: Card, stage: StageName): boolean {
  const f = thought.facts;
  switch (stage) {
    case "Мысль": return f.answers > 0 && f.openQuestions === 0;
    case "Сценарий": return f.scriptVersion !== null;
    case "Монтаж": return f.shotsTotal > 0;
    case "Съёмка": return f.shotsTotal > 0 && f.shotsHave >= f.shotsTotal;
    case "Слайды": return f.slides > 0;
    case "Выход": return Boolean(thought.publishedAt);
  }
}

export const missingShots = (thought: Card) => Math.max(0, thought.facts.shotsTotal - thought.facts.shotsHave);

export function computeCard(thought: Card): CardInfo {
  const stages = stagesFor(thought.format);
  const complete = stages.map((stage) => isStageComplete(thought, stage));
  const first = complete.indexOf(false);
  const index = first === -1 ? stages.length - 1 : first;
  const stage = stages[index];

  let blocker: string | undefined;
  if (stage === "Съёмка") {
    const missing = missingShots(thought);
    if (missing > 0) blocker = `Нет ${missing} ${plural(missing, ["кадра", "кадров", "кадров"])}`;
  }
  const shootIndex = stages.indexOf("Съёмка");
  const shootPending = shootIndex !== -1 && !complete[shootIndex];
  const risk = shootPending && thought.shoot && thought.publishDate && thought.shoot > thought.publishDate ? "Съёмка позже выхода" : undefined;

  let action: CardAction;
  switch (stage) {
    case "Мысль": action = { kind: "studio", tab: "Диалог", label: thought.facts.answers === 0 ? "Начать ›" : "Ответить на вопросы ›" }; break;
    case "Сценарий": action = { kind: "studio", tab: "Сценарий", label: "Собрать сценарий ›" }; break;
    case "Монтаж": action = { kind: "studio", tab: "Монтаж", label: "Собрать монтаж ›" }; break;
    case "Слайды": action = { kind: "studio", tab: "Карусель", label: "Слайды ›" }; break;
    case "Съёмка": action = { kind: "shoot", label: thought.shoot ? `Съёмка ${weekdayShort(thought.shoot)} ›` : "Снять ›" }; break;
    case "Выход": action = thought.publishedAt ? { kind: "done", label: "Вышло ✓" } : { kind: "release", label: "Отметить как вышло" }; break;
  }
  return { stages, index, stage, complete, blocker, risk, action };
}

/** Pipeline columns: one per reel stage; the carousel "Слайды" stage sits in the "Монтаж" column. */
export const PIPELINE_COLUMNS: readonly StageName[] = REEL_STAGES;
export const pipelineColumn = (stage: StageName): StageName => (stage === "Слайды" ? "Монтаж" : stage);
