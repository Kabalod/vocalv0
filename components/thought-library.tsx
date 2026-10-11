"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Circle,
  Columns3,
  LayoutGrid,
  List,
  Mic,
  Search,
  UserRound,
  X,
  ArrowUpDown,
  Settings,
  LogOut,
  Trash2,
  Lock,
} from "lucide-react";
import "./thought-library.css";
import { QuotaState } from "./vocal-flows";

type Layout = "desk" | "grid" | "list";
const statuses = ["Не завершена", "В работе", "Завершена"];
const titles = [
  "Привычка и мотивация",
  "Искренний коннект с немногими",
  "Почему мы откладываем самое важное",
  "Первый месяц в новом городе",
  "Маленькие шаги, которые меняют всё",
  "Как разрешить себе ничего не делать",
  "Тишина — тоже ответ",
  "Что остаётся после путешествия",
];
const items = Array.from({ length: 1248 }, (_, id) => ({
  id,
  title:
    titles[id % titles.length] +
    (id >= 8 ? ` · ${Math.floor(id / 8) + 1}` : ""),
  text: [
    "История о пробежке и простом первом шаге.",
    "Разговор о людях, близости и внимании.",
    "Записать, пока мысль ещё живая.",
  ][id % 3],
  status: id % 3,
  date: id < 3 ? "Сегодня, 12:40" : id < 6 ? "Вчера" : "Вт, 6 окт",
}));

export default function ThoughtLibrary({
  onOpen,
}: {
  onOpen: (title?: string) => void;
}) {
  const [layout, setLayout] = useState<Layout>("desk");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState(-1);
  const [sort, setSort] = useState<"new" | "old">("new");
  const [dateFilter, setDateFilter] = useState("all");
  const [dateOpen, setDateOpen] = useState(false);
  const [rangeStart, setRangeStart] = useState("");
  const [rangeEnd, setRangeEnd] = useState("");
  const today = dateFilter === "today";
  const dateOf = (id: number) => {
    const date = new Date("2026-10-09T12:00:00Z");
    date.setUTCDate(date.getUTCDate() - Math.floor(id / 3));
    return date.toISOString().slice(0, 10);
  };
  const [limit, setLimit] = useState(6);
  const [palette, setPalette] = useState(false);
  const [command, setCommand] = useState("");
  const [selected, setSelected] = useState(0);
  const [profile, setProfile] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [quotaExhausted, setQuotaExhausted] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const dateDialog = useRef<HTMLDialogElement>(null);
  const sortSheet = useRef<HTMLElement>(null);
  const profileSheet = useRef<HTMLElement>(null);
  useEffect(() => { setQuotaExhausted(new URLSearchParams(window.location.search).has("quota")); }, []);
  useEffect(() => { if (dateOpen) dateDialog.current?.showModal(); else dateDialog.current?.close() }, [dateOpen]);
  useEffect(() => {
    const panel = sortOpen ? sortSheet.current : profile ? profileSheet.current : null;
    if (!panel) return;
    const controls = Array.from(panel.querySelectorAll<HTMLElement>('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])'));
    controls[0]?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { sortOpen ? setSortOpen(false) : setProfile(false); return; }
      if (event.key !== 'Tab' || controls.length === 0) return;
      const first = controls[0], last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [sortOpen, profile]);
  const sentinel = useRef<HTMLDivElement>(null);
  const searchButton = useRef<HTMLButtonElement>(null);
  const matches = items
    .filter((item) => {
      const date = dateOf(item.id);
      const dateMatches =
        dateFilter === "all" ||
        (dateFilter === "today" && date === "2026-10-09") ||
        (dateFilter === "yesterday" && date === "2026-10-08") ||
        (dateFilter === "week" && date >= "2026-10-03") ||
        (dateFilter === "range" &&
          (!rangeStart || date >= rangeStart) &&
          (!rangeEnd || date <= rangeEnd));
      return (
        (filter < 0 || item.status === filter) &&
        dateMatches &&
        `${item.title} ${item.text}`.toLowerCase().includes(query.toLowerCase())
      );
    })
    .sort((a, b) => (sort === "new" ? a.id - b.id : b.id - a.id));
  const results = items
    .filter((item) =>
      `${item.title} ${item.text}`
        .toLowerCase()
        .includes(command.toLowerCase()),
    )
    .slice(0, 8);
  useEffect(() => {
    const saved = localStorage.getItem("vocal-library-layout");
    if (saved === "desk" || saved === "grid" || saved === "list")
      setLayout(saved);
  }, []);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPalette(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);
  useEffect(() => {
    if (palette) dialog.current?.showModal();
    else dialog.current?.close();
  }, [palette]);

  const changeLayout = (value: Layout) => {
    setLayout(value);
    localStorage.setItem("vocal-library-layout", value);
  };
  const badge = (status: number) => (
    <span className={`library-status status-${status}`}>
      <i role="img" aria-label={statuses[status]} />
      {statuses[status]}
    </span>
  );
  const photo = (id: number) => ({
    backgroundImage: "url(/images/thought-landscape.png)",
    backgroundPosition: `${20 + (id % 4) * 20}% center`,
  });
  const card = (item: (typeof items)[number]) => (
    <button
      className={`photo-card tilt-${item.id % 3}`}
      key={item.id}
      onClick={() => onOpen(item.title)}
      title={item.title}
    >
      <div className="photo-art" style={photo(item.id)}>
        <span className="photo-number">
          {String(item.id + 1).padStart(2, "0")}
        </span>
        <h2>{item.title}</h2>
      </div>
      <div className="photo-caption">
        <div>
          <time>{item.date}</time>
          {badge(item.status)}
        </div>
        <ArrowRight />
      </div>
    </button>
  );
  const row = (item: (typeof items)[number]) => (
    <button
      className="library-row"
      key={item.id}
      onClick={() => onOpen(item.title)}
      title={item.title}
    >
      <div
        className={`mini-photo tilt-${item.id % 3}`}
        style={photo(item.id)}
      />
      <div className="row-copy">
        <strong>{item.title}</strong>
        <span className="row-preview">{item.text}</span>
        <span className="mobile-row-meta"><span>● {statuses[item.status]} · версия {(item.id % 4) + 1}</span><time>{new Date(dateOf(item.id)).toLocaleDateString("ru-RU")}</time></span>
      </div>
      <div className="row-status">{badge(item.status)}</div>
      <span className="row-versions">версий: {(item.id % 4) + 1}</span>
      <time className="row-date">
        {new Date(dateOf(item.id)).toLocaleDateString("ru-RU")}
      </time>
      <ArrowRight />
    </button>
  );
  const filters = (
    <>
      {["Все", ...statuses].map((name, index) => (
        <button
          key={name}
          className={filter === index - 1 ? "selected" : ""}
          onClick={() => {
            setFilter(index - 1);
            setLimit(6);
          }}
        >
          <span>
            {index === 0 ? (
              <LayoutGrid />
            ) : index === 3 ? (
              <CheckCircle2 />
            ) : (
              <Circle />
            )}
            {name === "Завершена" ? "Завершена" : name}
          </span>
          {index === 0 && <small>{items.length.toLocaleString("ru-RU")}</small>}
        </button>
      ))}
    </>
  );
  return (
    <div className="library-shell">
      <aside className="library-sidebar">
        <a className="library-logo" href="#">
          Vocal<span>ваши мысли, вашим голосом</span>
        </a>
        <button
          className="library-date"
          onClick={() => setDateOpen(true)}
          aria-haspopup="dialog"
        >
          <CalendarDays /> Дата
        </button>
        <div className="library-nav">
          <LayoutGrid /> Мысли
        </div>
        <p className="filter-label">СТАТУС</p>
        <div className="library-filters">{filters}</div>
        <button className="library-profile" onClick={() => setProfile(true)}>
          <UserRound /> Профиль
        </button>
      </aside>
      <main className="library-main">
        <header className="library-toolbar">
          <h1>Мысли</h1>
          <button
            className="mobile-date"
            onClick={() => setDateOpen(true)}
            aria-haspopup="dialog"
          >
            <CalendarDays /> Дата
          </button>
          <div className="library-search">
            <Search />
            <input
              aria-label="Найти мысль"
              placeholder="Найти мысль по названию или тексту"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setLimit(6);
              }}
            />
            <button
              ref={searchButton}
              onClick={() => setPalette(true)}
              aria-label="Открыть командную палитру"
              className="desktop-command-key"
            >
              ⌘K
            </button>
            <button className="mobile-sort-trigger" aria-label="Сортировка" onClick={() => setSortOpen(true)}><ArrowUpDown /></button>
          </div>
          <div className="library-sort" role="group" aria-label="Сортировка">
            {(["new", "old"] as const).map((value) => (
              <button
                key={value}
                aria-pressed={sort === value}
                className={sort === value ? "selected" : ""}
                onClick={() => {
                  setSort(value);
                  setLimit(6);
                }}
              >
                {value === "new" ? "Новые" : "Старые"}
              </button>
            ))}
          </div>
          <button className="library-new" disabled={quotaExhausted} onClick={() => onOpen("Новая мысль")}>
            {quotaExhausted ? <Lock /> : <Mic />} Новая мысль
          </button>
          <div className="library-layouts" aria-label="Раскладка">
            {(
              [
                { key: "desk", label: "Стол", Icon: LayoutGrid },
                { key: "grid", label: "Сетка", Icon: Columns3 },
                { key: "list", label: "Список", Icon: List },
              ] as const
            ).map(({ key, label, Icon }) => (
              <button
                key={key}
                title={label}
                aria-label={label}
                aria-pressed={layout === key}
                className={layout === key ? "selected" : ""}
                onClick={() => changeLayout(key)}
              >
                <Icon />
              </button>
            ))}
          </div>
          <div className="mobile-filters">{filters}</div>
        </header>
        <div className={`library-content layout-${layout}`}>
          {quotaExhausted && <QuotaState compact />}
          <div className="library-context">
            <span>{today ? "Сегодня" : "Ваша библиотека"}</span>
            <span>{matches.length.toLocaleString("ru-RU")} мыслей</span>
          </div>
          {layout === "desk" && (
            <h2 className="mobile-section-title">На столе сейчас</h2>
          )}
          {layout !== "list" && (
            <section className="library-cards" aria-label="Карточки мыслей">
              {matches.slice(0, limit).map(card)}
            </section>
          )}
          {layout === "desk" && (
            <h2 className="mobile-section-title all-title">Все мысли</h2>
          )}
          <section className="library-rows" aria-label="Список мыслей">
            {matches.slice(0, limit).map(row)}
          </section>
          {matches.length === 0 && (
            <div className="library-empty">
              <Search />
              <h2>Ничего не найдено</h2>
              <button onClick={() => { setQuery(""); setFilter(-1); setDateFilter("all"); }}>Сбросить фильтры</button>
            </div>
          )}
          <div ref={sentinel} className="library-sentinel" />
          <div className="library-pagination">
            <button
              disabled={limit >= matches.length}
              onClick={() => setLimit((n) => n + 6)}
            >
              Показано {Math.min(limit, matches.length)} из{" "}
              {matches.length.toLocaleString("ru-RU")}
              {limit < matches.length
                ? ` · Ещё ${Math.min(6, matches.length - limit)}`
                : " · Все мысли загружены"}
            </button>
          </div>
        </div>
      </main>
      <nav className="library-bottom" aria-label="Мобильная навигация">
        <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          <LayoutGrid />
          Мысли
        </button>
          <button
            className="library-new-mic"
            aria-label={quotaExhausted ? "Лимит мыслей исчерпан" : "Новая мысль"}
            disabled={quotaExhausted}
            onClick={() => onOpen("Новая мысль")}
          >
            {quotaExhausted ? <Lock /> : <Mic />}
          </button>
        <button onClick={() => setProfile(true)}>
          <UserRound />
          Профиль
        </button>
      </nav>
      <dialog
        ref={dialog}
        className="library-command"
        onCancel={() => setPalette(false)}
        onClose={() => {
          setPalette(false);
          searchButton.current?.focus();
        }}
        onClick={(e) => {
          if (e.target === dialog.current) setPalette(false);
        }}
      >
        <div className="command-search">
          <Search />
          <input
            autoFocus
            aria-label="Поиск по Vocal"
            placeholder="Поиск по Vocal"
            value={command}
            onChange={(e) => {
              setCommand(e.target.value);
              setSelected(0);
            }}
            onKeyDown={(e) => {
              if (e.nativeEvent.isComposing || e.keyCode === 229) return;
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setSelected((n) => Math.min(n + 1, results.length - 1));
              }
              if (e.key === "ArrowUp") {
                e.preventDefault();
                setSelected((n) => Math.max(n - 1, 0));
              }
              if (e.key === "Enter" && results[selected]) {
                setPalette(false);
                onOpen(results[selected].title);
              }
            }}
          />
          <button aria-label="Закрыть поиск" onClick={() => setPalette(false)}>
            <X />
          </button>
        </div>
        <div className="command-matches">
          {results.map((item, index) => (
            <button
              className={selected === index ? "selected" : ""}
              key={item.id}
              onClick={() => {
                setPalette(false);
                onOpen(item.title);
              }}
            >
              <strong>{item.title}</strong>
              <small>{item.text}</small>
            </button>
          ))}
          {!results.length && <p>Ничего не найдено</p>}
        </div>
        <p className="command-help">↑↓ Выбрать · Enter Открыть · Esc Закрыть</p>
      </dialog>
      <dialog ref={dateDialog} className="library-command date-dialog" onCancel={() => setDateOpen(false)} onClose={() => setDateOpen(false)} onClick={e => { if (e.target === dateDialog.current) setDateOpen(false) }}>
        <header><h2>Дата</h2><button aria-label="Закрыть выбор даты" onClick={() => setDateOpen(false)}><X /></button></header>
        <div className="mobile-calendar"><div className="calendar-heading"><button aria-label="Предыдущий месяц">‹</button><strong>Октябрь 2026</strong><button aria-label="Следующий месяц">›</button></div><div className="calendar-presets">{[['today','Сегодня'],['yesterday','Вчера'],['week','Неделя']].map(([value,label])=><button key={value} className={dateFilter===value?'selected':''} onClick={()=>{setDateFilter(value);setLimit(6)}}>{label}</button>)}</div><div className="calendar-week">{['Пн','Вт','Ср','Чт','Пт','Сб','Вс'].map(day => <span key={day}>{day}</span>)}</div><div className="calendar-days">{Array.from({ length: 3 }, (_, index) => <span key={`blank-${index}`} />)}{Array.from({ length: 31 }, (_, index) => { const value=`2026-10-${String(index+1).padStart(2,'0')}`; const selectedDay=dateFilter==='range'&&rangeStart===value; return <button key={index + 1} className={`${index+1===9?'today ':''}${selectedDay?'selected ':''}${[2,5,7,8,9].includes(index+1)?'has-thought':''}`} onClick={() => { setDateFilter('range'); setRangeStart(value); setRangeEnd(value); setLimit(6) }}>{index + 1}</button>})}</div><button className={`month-chip ${dateFilter==='all'?'selected':''}`} onClick={() => { setDateFilter('all'); setLimit(6) }}>Весь месяц</button></div>
        <div className="date-options">{[['all', 'Все даты'], ['today', 'Сегодня'], ['yesterday', 'Вчера'], ['week', 'Неделя'], ['range', 'Диапазон']].map(([value, label]) => <button key={value} aria-pressed={dateFilter === value} className={dateFilter === value ? 'selected' : ''} onClick={() => { setDateFilter(value); setLimit(6); if (value !== 'range') setDateOpen(false) }}>{label}</button>)}</div>
        {dateFilter === 'range' && <div className="date-range"><label>С<input type="date" value={rangeStart} max={rangeEnd || undefined} onChange={e => { setRangeStart(e.target.value); setLimit(6) }} /></label><label>По<input type="date" value={rangeEnd} min={rangeStart || undefined} onChange={e => { setRangeEnd(e.target.value); setLimit(6) }} /></label><button onClick={() => setDateOpen(false)} disabled={!!rangeStart && !!rangeEnd && rangeStart > rangeEnd}>Применить</button></div>}
      </dialog>
      {sortOpen && <div className="sheet-backdrop" onClick={() => setSortOpen(false)}><section ref={sortSheet} className="mobile-sheet sort-sheet" role="dialog" aria-modal="true" aria-label="Сортировка" onClick={e => e.stopPropagation()}><button className="sheet-grabber" aria-label="Закрыть" onClick={() => setSortOpen(false)} /><h2>Сортировка</h2>{(['new','old'] as const).map(value => <button className={sort === value ? 'selected' : ''} key={value} onClick={() => { setSort(value); setLimit(6); setSortOpen(false) }}>{value === 'new' ? 'Новые' : 'Старые'}</button>)}</section></div>}
      {profile && (
        <div className="sheet-backdrop" onClick={() => setProfile(false)}>
          <section ref={profileSheet} className="mobile-sheet library-profile-panel" role="dialog" aria-modal="true" aria-label="Профиль" onClick={e => e.stopPropagation()}>
            <button className="sheet-grabber" aria-label="Закрыть профиль" onClick={() => setProfile(false)} />
            <div className="profile-avatar"><UserRound /></div>
            <h2>Демонстрационный аккаунт Vocal</h2>
            <p>Мысли в этой библиотеке — моковые данные.</p>
            <div className="quota-card"><strong>Осталось 100 из 100 мыслей</strong><span role="progressbar" aria-label="Использование мыслей" aria-valuemin={0} aria-valuemax={100} aria-valuenow={100}><i /></span><div className="quota-footer"><small>Период до 12.11</small><button>Продлить</button></div></div>
            <button className="profile-row"><Settings />Настройки</button>
            <button className="profile-row"><LogOut />Выйти</button>
            <button className="profile-row danger"><Trash2 />Удалить аккаунт</button>
          </section>
        </div>
      )}
    </div>
  );
}
