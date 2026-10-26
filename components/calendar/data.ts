// Mock data for the calendar. One table for every mode (week, month, pipeline) and both layouts.
// Only facts live here: what has been done on a thought. Stage, blocker and action are computed in stage.ts.

export type Format = "Рилс" | "Карусель";
export type ThoughtId = "job" | "habit" | "phone" | "gym" | "coffee" | "morning";
export type OutputId = string;

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

/** A thought: the idea and the work done on it. One thought can have several outputs. */
export type Thought = { id: ThoughtId; title: string; cover: string; facts: Facts };

/** An output (выход): one piece published from a thought. The calendar card is an output, not a thought. */
export type Output = {
  id: OutputId;
  thoughtId: ThoughtId;
  format: Format;
  /** Planned publish day, ISO "YYYY-MM-DD". No date = the output sits in "Без даты". */
  publishDate?: string;
  /** Day it was published, ISO. Set = the output is out. */
  publishedAt?: string;
  /** Shooting day, ISO (reels). */
  shoot?: string;
};

/** What the views draw: an output joined with its thought. `id` is the output id. */
export type Card = Omit<Thought, "id"> & Output;

export const TODAY = "2026-10-14";

export const THOUGHTS: Thought[] = [
  { id: "job", title: "Почему я ушёл из найма", cover: "/events/evening.png", facts: { answers: 4, openQuestions: 0, scriptVersion: 3, shotsTotal: 0, shotsHave: 0, slides: 7 } },
  { id: "habit", title: "Привычка и мотивация", cover: "/events/gym-road.png", facts: { answers: 4, openQuestions: 0, scriptVersion: 3, shotsTotal: 5, shotsHave: 3, slides: 0 } },
  { id: "phone", title: "Утро без телефона", cover: "/events/coffee.png", facts: { answers: 3, openQuestions: 0, scriptVersion: 2, shotsTotal: 0, shotsHave: 0, slides: 0 } },
  { id: "gym", title: "Три ошибки новичка в зале", cover: "/events/gym-road.png", facts: { answers: 2, openQuestions: 1, scriptVersion: null, shotsTotal: 0, shotsHave: 0, slides: 0 } },
  { id: "coffee", title: "Кофе как ритуал", cover: "/events/coffee.png", facts: { answers: 3, openQuestions: 0, scriptVersion: null, shotsTotal: 0, shotsHave: 0, slides: 0 } },
  // One thought, two outputs: a reel (shooting still pending) and a carousel (slides built), on different days.
  { id: "morning", title: "Как я начинаю утро", cover: "/events/evening.png", facts: { answers: 5, openQuestions: 0, scriptVersion: 1, shotsTotal: 4, shotsHave: 1, slides: 5 } },
];

export const OUTPUTS: Output[] = [
  { id: "job-carousel", thoughtId: "job", format: "Карусель", publishDate: "2026-10-14" },
  { id: "habit-reel", thoughtId: "habit", format: "Рилс", publishDate: "2026-10-16", shoot: "2026-10-15" },
  { id: "phone-reel", thoughtId: "phone", format: "Рилс", publishDate: "2026-10-18" },
  { id: "gym-reel", thoughtId: "gym", format: "Рилс" },
  { id: "coffee-carousel", thoughtId: "coffee", format: "Карусель" },
  { id: "morning-reel", thoughtId: "morning", format: "Рилс", publishDate: "2026-10-21", shoot: "2026-10-19" },
  { id: "morning-carousel", thoughtId: "morning", format: "Карусель", publishDate: "2026-10-17" },
];

/** Planning state the author changes in the calendar (publish day, "вышло"). Everything else is derived. */
export type PlanEntry = { publishDate?: string; publishedAt?: string };
export type Plan = Record<OutputId, PlanEntry>;

export const initialPlan = (): Plan =>
  Object.fromEntries(OUTPUTS.map((o) => [o.id, { publishDate: o.publishDate, publishedAt: o.publishedAt }]));

export const toCard = (output: Output, plan: Plan): Card => {
  const thought = THOUGHTS.find((t) => t.id === output.thoughtId)!;
  return { ...output, title: thought.title, cover: thought.cover, facts: thought.facts, ...plan[output.id] };
};

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
