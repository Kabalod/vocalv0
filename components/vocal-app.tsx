"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Video, MessageCircle, Pencil,
  Archive,
  ArrowLeft,
  ArrowRight,
  Check,
  Copy,
  Download,
  FileText,
  HelpCircle,
  Lightbulb,
  Mic,
  MoreHorizontal,
  Plus,
  Search,
  Settings,
  Sparkles,
  StopCircle,
  Trash2,
  UserRound,
} from "lucide-react";

import ThoughtLibrary from "./thought-library";
import './focused-thought.css';
import './macos-thought.css';

type Tab = "Дубли" | "Диалог" | "Сценарий";
type RecordingState =
  "idle" | "recording" | "transcribing" | "review" | "error";
const thoughts = [
  {
    title: "Привычка и мотивация",
    preview: "На третий день мне стало лень, но я всё равно вышел…",
    status: "Не завершена",
    versions: 2,
    time: "10:42",
    group: "Сегодня",
  },
  {
    title: "Переезд в другой город",
    preview: "Первый месяц оказался совсем не таким, как я ожидал.",
    status: "Не завершена",
    versions: 1,
    time: "Вчера",
    group: "Вчера",
  },
  {
    title: "Как не выгорать",
    preview: "Я понял, что отдых — это тоже часть работы.",
    status: "Завершена",
    versions: 3,
    time: "Пн",
    group: "Раньше",
  },
  {
    title: "Ритм без мотивации",
    preview: "Маленькие шаги складываются в привычку.",
    status: "Завершена",
    versions: 1,
    time: "12 ноя",
    group: "Раньше",
  },
];
const messages = [
  { role: "vocal", text: "Почему привычка остаётся, когда мотивация исчезла?" },
  {
    role: "author",
    text: "На третий день мне стало лень, но я всё равно вышел, потому что так уже делал вчера.",
  },
  {
    role: "vocal",
    note: "Чем подробнее вы рассказываете, тем лучше получится сценарий для рилс.",
    text: "Что вы почувствовали, когда всё-таки вышли на пробежку?",
  },
  { role: "author", text: "Стало легче дышать. Дальше пошло само." },
];

function Rail({
  onThoughts,
  onNew,
}: {
  onThoughts: () => void;
  onNew: () => void;
}) {
  return (
    <aside className="icon-rail">
      <div className="rail-logo">V</div>
      <button
        className="rail-button rail-active"
        aria-label="Мысли"
        onClick={onThoughts}
      >
        <Archive />
      </button>
      <button className="rail-button" aria-label="Поиск" onClick={onThoughts}>
        <Search />
      </button>
      <button className="rail-button" aria-label="Новая мысль" onClick={onNew}>
        <Plus />
      </button>
      <div className="rail-spacer" />
      <button className="rail-button" aria-label="Профиль">
        <UserRound />
      </button>
    </aside>
  );
}
function ThoughtList({ onSelect }: { onSelect: (title: string) => void }) {
  return (
    <section className="thought-pane">
      <div className="thoughts-heading">
        <div>
          <span className="eyebrow">Vocal</span>
          <h2>
            Мысли <small>24</small>
          </h2>
        </div>
        <button className="icon-button" aria-label="Настройки">
          <Settings />
        </button>
      </div>
      <div className="thought-search">
        <Search />
        <input placeholder="Поиск мыслей" aria-label="Поиск мыслей" />
      </div>
      <div className="thought-filters">
        <button className="filter-active">Все</button>
        <button>Не завершены</button>
        <button>Завершены</button>
      </div>
      <div className="thought-groups">
        {["Сегодня", "Вчера", "Раньше"].map((group) => (
          <div className="thought-group" key={group}>
            <div className="group-label">{group}</div>
            {thoughts
              .filter((item) => item.group === group)
              .map((item) => (
                <button
                  className="thought-row"
                  key={item.title}
                  onClick={() => onSelect(item.title)}
                >
                  <span className="thought-icon">
                    <FileText />
                  </span>
                  <span className="thought-copy">
                    <strong>{item.title}</strong>
                    <small>{item.preview}</small>
                    <em>
                      {item.status} · {item.versions}{" "}
                      {item.versions === 1 ? "версия" : "версии"}
                    </em>
                  </span>
                  <time>{item.time}</time>
                  <MoreHorizontal className="row-more" />
                </button>
              ))}
          </div>
        ))}
      </div>
      <button className="load-more" type="button">
        Показать ещё
      </button>
    </section>
  );
}
function ThoughtShell({
  children,
  onThoughts,
  onNew,
  onSelect,
}: {
  children: React.ReactNode;
  onThoughts: () => void;
  onNew: () => void;
  onSelect: (title: string) => void;
}) {
  return (
    <div className="vocal-shell">
      <main className="app-main focused-thought">{children}</main>
    </div>
  );
}
function CommandPalette({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState("");
  const results = useMemo(
    () =>
      thoughts
        .filter((item) =>
          `${item.title} ${item.preview}`
            .toLowerCase()
            .includes(query.toLowerCase()),
        )
        .slice(0, 5),
    [query],
  );
  return (
    <div className="palette-backdrop" onMouseDown={onClose}>
      <section
        className="command-palette"
        onMouseDown={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Командная палитра"
      >
        <div className="palette-input">
          <Search />
          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Поиск по Vocal"
          />
          <kbd>Esc</kbd>
        </div>
        <div className="palette-results">
          {results.map((item, index) => (
            <button
              key={item.title}
              className={
                index === 0 ? "palette-result active" : "palette-result"
              }
            >
              <FileText />
              <span>
                <strong>{item.title}</strong>
                <small>{item.preview}</small>
              </span>
              <kbd>↵</kbd>
            </button>
          ))}
        </div>
        <div className="palette-footer">
          <span>↑↓ навигация</span>
          <span>↵ открыть</span>
        </div>
      </section>
    </div>
  );
}
function Header({
  title,
  tab,
  setTab,
  onThoughts,
  onOpenMenu,
}: {
  title: string;
  tab: Tab;
  setTab: (tab: Tab) => void;
  onThoughts: () => void;
  onOpenMenu: () => void;
}) {
  const tabIcons = { Дубли: Video, Диалог: MessageCircle, Сценарий: FileText };
  return (
    <header className="workspace-header">
      <button className="back-link" onClick={onThoughts}>
        <ArrowLeft /> Все мысли
      </button>
      <div className="title-row">
        <div>
          <span className="eyebrow">Сегодня, 10:42</span>
          <h1>{title}</h1>
        </div>
        <span className="status">Не завершена</span>
        <button
          className="more-button"
          aria-label="Меню мысли"
          onClick={onOpenMenu}
        >
          <MoreHorizontal />
        </button>
      </div>
      <nav className="tabs" aria-label="Раздел мысли">
        {(["Дубли", "Диалог", "Сценарий"] as Tab[]).map((item) => {
          const Icon = tabIcons[item];
          return (
            <button
              key={item}
              className={tab === item ? "tab tab-active" : "tab"}
              onClick={() => setTab(item)}
              aria-label={item}
              title={item}
              aria-pressed={tab === item}
            >
              <Icon className={item === 'Дубли' ? 'mobile-drafts-icon' : undefined} />
              {item === 'Дубли' && <Copy className="desktop-drafts-icon" />}
              <span>{tab === item ? item : ""}</span>
            </button>
          );
        })}
      </nav>
    </header>
  );
}
function Dialog() {
  const [draft, setDraft] = useState("");
  const [recording, setRecording] = useState<RecordingState>("idle");
  const [transcript, setTranscript] = useState("");
  const [seconds, setSeconds] = useState(0);
  const [sent, setSent] = useState<string[]>([]);
  useEffect(() => {
    if (recording !== 'recording') return;
    const timer = window.setInterval(() => setSeconds(n => n + 1), 1000);
    return () => window.clearInterval(timer);
  }, [recording]);
  useEffect(() => {
    if (recording !== 'transcribing') return;
    const timer = window.setTimeout(() => {
      if (seconds < 2) { setRecording('error'); return; }
      setTranscript('На третий день мне стало лень, но я всё равно вышел.');
      setRecording('review');
    }, 1200);
    return () => window.clearTimeout(timer);
  }, [recording, seconds]);
  const start = () => { setSeconds(0); setTranscript(''); setRecording('recording'); };
  return (
    <section className="dialog-view">
      <div className="conversation">
        {messages.map((message, index) => (
          <article key={index} className={`message message-${message.role}`}>
            <div className="message-label">
              {message.role === "vocal" ? "Vocal" : "Вы"}
            </div>
            {message.note && (
              <p className="message-note">
                <Lightbulb />
                {message.note}
              </p>
            )}
            <p>{message.text}</p>
          </article>
        ))}
      </div>
      {sent.map((text, index) => <article key={index} className="message message-author"><div className="message-label">Вы</div><p>{text}</p></article>)}
      {recording === 'recording' && <div className="recording-status" role="status"><Mic className="desktop-recording-mic" /><div className="recording-wave" aria-hidden="true">{Array.from({length: 15}, (_, i) => <i key={i} style={{animationDelay: `${i * 0.09}s`}} />)}</div><p>Идёт запись · {String(Math.floor(seconds / 60)).padStart(2, '0')}:{String(seconds % 60).padStart(2, '0')}</p><div><button className="button button-primary" onClick={() => setRecording('transcribing')}><StopCircle /> Стоп</button><button className="button button-outline" onClick={() => setRecording('idle')}>Отмена</button></div></div>}
      {recording === 'error' && <div className="recording-status" role="alert"><p>Не расслышали</p><button className="button button-outline" onClick={start}>Записать заново</button></div>}
      {recording === "transcribing" && (
        <div className="transcribing" role="status">
          Распознаём…
          <span />
          <span />
          <span />
        </div>
      )}
      {recording === "review" && (
        <div className="transcript-card">
          <label htmlFor="transcript">Проверьте текст</label>
          <textarea
            id="transcript"
            value={transcript}
            onChange={(event) => setTranscript(event.target.value)}
          />
          <div>
            <button
              className="button button-outline"
              onClick={start}
            >
              Записать заново
            </button>
            <button
              className="button button-primary"
              onClick={() => {
                if (!transcript.trim()) return;
                setSent(previous => [...previous, transcript.trim()]);
                setTranscript('');
                setRecording("idle");
              }}
            >
              Отправить
            </button>
          </div>
        </div>
      )}
      {recording === "idle" && (
        <div className="voice-composer">
          <div className="mic-area">
            <button
              className="mic-button"
              onClick={start}
              aria-label="Нажмите и говорите"
            ><Mic /></button>
            <span>Нажмите и говорите</span>
            <small>Демо записи · ответы моковые</small>
          </div>
          <form
            className="type-reply"
            onSubmit={(event) => {
              event.preventDefault();
              if (!draft.trim()) return;
              setSent(previous => [...previous, draft.trim()]);
              setDraft("");
            }}
          >
            <button type="button" className="desktop-composer-mic" aria-label="Нажмите и говорите" onClick={start}><Mic /></button>
            <input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Или напишите ответ"
              aria-label="Или напишите ответ"
            />
            <button aria-label="Отправить" className={draft.trim() ? 'has-text' : ''}>
              <ArrowRight />
            </button>
          </form>
        </div>
      )}
    </section>
  );
}
function ScriptView() {
  return (
    <section className="script-layout">
      <div className="script-main">
        <article className="source-card">
          <p className="eyebrow">Основа · ваш дубль №1</p>
          <p>
            Три недели назад я начал бегать по утрам. На третий день мне стало
            лень, но я всё равно вышел, потому что так уже делал вчера.
          </p>
        </article>
        <div className="vocal-prompt">
          <div>
            <div className="message-label">Vocal</div>
            <p>
              Я понял так: привычка держится на простом первом шаге, а не на
              желании. Собрать сценарий?
            </p>
          </div>
          <button className="button button-primary">
            <Sparkles />
            Сгенерировать сценарий
          </button>
        </div>
        <div className="version-heading">
          <h2>Версия 2 из 2</h2>
          <div className="version-control">
            <button className="icon-button" aria-label="Предыдущая версия">
              <ArrowLeft />
            </button>
            <button
              className="icon-button"
              aria-label="Следующая версия"
              disabled
            >
              <ArrowRight />
            </button>
          </div>
        </div>
        <article className="script-card">
          <p className="script-text">
            Три недели назад я начал бегать по утрам. На третий день мне стало
            лень, но я всё равно вышел, потому что так уже делал вчера. Привычка
            держится не на желании, а на простом первом шаге: надеть кроссовки.
          </p>
        </article>
      </div>
      <aside className="version-inspector">
        <div className="inspector-title">
          Версия <MoreHorizontal />
        </div>
        <div className="inspector-toggle">
          <button className="active">Изменения</button>
          <button>Основа</button>
        </div>
        <p>Вторая версия собрана из ваших слов и уточнений в диалоге.</p>
        <div className="inspector-item">
          <Check /> Убрал повтор и оставил ваши слова.
        </div>
        <div className="inspector-item">
          <Check /> Добавил фразу про первый шаг.
        </div>
        <div className="inspector-actions">
          <button className="button button-outline"><Pencil /> Править</button>
          <button className="button button-outline">
            <Copy /> Копировать
          </button>
          <button className="button button-outline">
            <Download /> Скачать
          </button>
          <button className="button button-primary">Сделать итоговой</button>
        </div>
      </aside>
    </section>
  );
}
function DraftsView() {
  return (
    <section className="drafts-view">
      <Copy />
      <h2>Дубли</h2>
      <p>Здесь появятся ваши голосовые дубли.</p>
      <button className="button button-primary">
        <Mic /> Записать дубль
      </button>
    </section>
  );
}
export default function VocalApp() {
  const [tab, setTab] = useState<Tab>("Диалог");
  const [showThoughts, setShowThoughts] = useState(true);
  const [palette, setPalette] = useState(false);
  const [menu, setMenu] = useState(false);
  const [activeThought, setActiveThought] = useState("Привычка и мотивация");
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPalette(true);
      }
      if (event.key === "Escape") {
        setPalette(false);
        setMenu(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);
  if (showThoughts)
    return (
      <ThoughtLibrary
        onOpen={(title) => {
          setActiveThought(title || "Новая мысль");
          setShowThoughts(false);
          setPalette(false);
        }}
      />
    );
  return (
    <ThoughtShell
      onThoughts={() => setShowThoughts(true)}
      onNew={() => setShowThoughts(true)}
      onSelect={setActiveThought}
    >
      <Header
        title={activeThought}
        tab={tab}
        setTab={setTab}
        onThoughts={() => setShowThoughts(true)}
        onOpenMenu={() => setMenu(!menu)}
      />
      {menu && (
        <div className="thought-menu">
          <button>
            <Mic />
            Записать дубль
          </button>
          <button className="danger">
            <Trash2 />
            Удалить мысль
          </button>
        </div>
      )}
      {tab === "Диалог" && <Dialog />}
      {tab === "Сценарий" && <ScriptView />}
      {tab === "Дубли" && <DraftsView />}
      {palette && <CommandPalette onClose={() => setPalette(false)} />}
    </ThoughtShell>
  );
}
function ThoughtsPage({ onOpen }: { onOpen: () => void }) {
  return (
    <div className="vocal-shell">
      <Rail onThoughts={() => {}} onNew={onOpen} />
      <main className="thoughts-page">
        <header className="thoughts-page-header">
          <div>
            <span className="eyebrow">Ваше пространство</span>
            <h1>
              Мысли <small>24</small>
            </h1>
            <p>Голосовые заметки, из которых рождаются сценарии.</p>
          </div>
          <button className="button button-primary" onClick={onOpen}>
            <Plus />
            Новая мысль
          </button>
        </header>
        <div className="thoughts-toolbar">
          <div className="thought-search">
            <Search />
            <input
              placeholder="Поиск по названию и тексту"
              aria-label="Поиск по названию и тексту"
            />
          </div>
          <div className="thought-filters">
            <button className="filter-active">Все</button>
            <button>Не завершены</button>
            <button>Завершены</button>
          </div>
        </div>
        <div className="thoughts-full-list">
          {["Сегодня", "Вчера", "Раньше"].map((group) => (
            <section key={group}>
              <h2>{group}</h2>
              {thoughts
                .filter((item) => item.group === group)
                .map((item) => (
                  <button
                    className="full-thought-row"
                    key={item.title}
                    onClick={onOpen}
                  >
                    <span className="thought-icon">
                      <FileText />
                    </span>
                    <span>
                      <strong>{item.title}</strong>
                      <small>{item.preview}</small>
                      <em>
                        {item.status} · {item.versions} версии
                      </em>
                    </span>
                    <time>{item.time}</time>
                    <MoreHorizontal />
                  </button>
                ))}
            </section>
          ))}
        </div>
        <button className="load-more">Показать ещё</button>
      </main>
    </div>
  );
}
export { Dialog, ScriptView, DraftsView };

// lucide-react icons use the shared 1.6px visual weight through CSS.
