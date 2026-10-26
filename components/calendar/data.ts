// Mock data for the calendar. One table for every mode (week, month, pipeline) and both layouts.
// Only facts live here: what has been done on a thought. Stage, blocker and action are computed in stage.ts.

export type Format = "Рилс" | "Карусель";
export type ThoughtId = "job" | "habit" | "phone" | "gym" | "coffee";

export type Facts = {
  /** Author answers in the dialogue. */
  answers: number;
  /** Questions the author has not answered yet. */
  openQuestions: number;
  /** Latest script version, null while there is no script. */
  scriptVersion: number | null;
  /** Shot plan (reels): shots in the plan and shots already filmed or found in the diary. */
  shotsTotal: number;
  shotsHave: number;
  /** Carousel slides built. */
  slides: number;
};

export type Thought = {
  id: ThoughtId;
  title: string;
  format: Format;
  cover: string;
  facts: Facts;
  /** Release day, ISO "YYYY-MM-DD". No date = the thought sits in "Без даты". */
  release?: string;
  /** Shooting day, ISO. */
  shoot?: string;
  released?: boolean;
};

export const TODAY = "2026-10-14";

export const THOUGHTS: Thought[] = [
  { id: "job", title: "Почему я ушёл из найма", format: "Карусель", cover: "/events/evening.png", release: "2026-10-14", facts: { answers: 4, openQuestions: 0, scriptVersion: 3, shotsTotal: 0, shotsHave: 0, slides: 7 } },
  { id: "habit", title: "Привычка и мотивация", format: "Рилс", cover: "/events/gym-road.png", release: "2026-10-16", shoot: "2026-10-15", facts: { answers: 4, openQuestions: 0, scriptVersion: 3, shotsTotal: 5, shotsHave: 3, slides: 0 } },
  { id: "phone", title: "Утро без телефона", format: "Рилс", cover: "/events/coffee.png", release: "2026-10-18", facts: { answers: 3, openQuestions: 0, scriptVersion: 2, shotsTotal: 0, shotsHave: 0, slides: 0 } },
  { id: "gym", title: "Три ошибки новичка в зале", format: "Рилс", cover: "/events/gym-road.png", facts: { answers: 2, openQuestions: 1, scriptVersion: null, shotsTotal: 0, shotsHave: 0, slides: 0 } },
  { id: "coffee", title: "Кофе как ритуал", format: "Карусель", cover: "/events/coffee.png", facts: { answers: 3, openQuestions: 0, scriptVersion: null, shotsTotal: 0, shotsHave: 0, slides: 0 } },
];

/** Planning state the author changes in the calendar (release day, "вышло"). Everything else is derived. */
export type PlanEntry = { release?: string; released?: boolean };
export type Plan = Record<ThoughtId, PlanEntry>;

export const initialPlan = (): Plan =>
  Object.fromEntries(THOUGHTS.map((t) => [t.id, { release: t.release, released: t.released }])) as Plan;

export const withPlan = (thought: Thought, plan: Plan): Thought => ({ ...thought, release: plan[thought.id].release, released: plan[thought.id].released });

// Dates are ISO day strings so they compare as strings and survive serialisation.
export const iso = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
export const parseDay = (value: string) => { const [y, m, d] = value.split("-").map(Number); return new Date(y, m - 1, d); };
export const addDays = (value: string, n: number) => { const d = parseDay(value); d.setDate(d.getDate() + n); return iso(d); };
export const mondayOf = (value: string) => { const d = parseDay(value); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return iso(d); };

const WEEKDAY_SHORT = ["вс", "пн", "вт", "ср", "чт", "пт", "сб"];
const WEEKDAY_FULL = ["Воскресенье", "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"];
const MONTH_GEN = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"];
const MONTH_NOM = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];

export const weekdayShort = (value: string) => WEEKDAY_SHORT[parseDay(value).getDay()];
export const dayLabel = (value: string) => { const d = parseDay(value); return `${weekdayShort(value)}, ${d.getDate()} ${MONTH_GEN[d.getMonth()].slice(0, 3)}`; };
export const dayLabelFull = (value: string) => { const d = parseDay(value); return `${WEEKDAY_FULL[d.getDay()]}, ${d.getDate()} ${MONTH_GEN[d.getMonth()]}`; };
export const monthTitle = (value: string) => { const d = parseDay(value); return `${MONTH_NOM[d.getMonth()]} ${d.getFullYear()}`; };
export const dayOfMonth = (value: string) => parseDay(value).getDate();

/** Pick the Russian plural form: plural(2, ["кадр", "кадра", "кадров"]) → "кадра". */
export const plural = (n: number, forms: [string, string, string]) => {
  const mod100 = Math.abs(n) % 100;
  const mod10 = mod100 % 10;
  if (mod100 > 10 && mod100 < 20) return forms[2];
  if (mod10 === 1) return forms[0];
  if (mod10 >= 2 && mod10 <= 4) return forms[1];
  return forms[2];
};
