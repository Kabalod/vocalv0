"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { ArrowLeft, Check, ChevronDown, LogOut, Pencil, Settings, Sparkles, Trash2, X } from "lucide-react";
import { ScriptBuildingState } from "./vocal-flows";
import "./desktop-views.css";

const DESKTOP_QUERY = "(min-width:1024px)";

/** True from 1024px up. The desktop screens below replace the mobile/tablet ones only there. */
export function useIsDesktop() {
  return useSyncExternalStore(
    (notify) => {
      const query = window.matchMedia(DESKTOP_QUERY);
      query.addEventListener("change", notify);
      return () => query.removeEventListener("change", notify);
    },
    () => window.matchMedia(DESKTOP_QUERY).matches,
    () => false,
  );
}

export type ScriptVersion = {
  id: string;
  name: string;
  tag?: string;
  date: string;
  text: string[];
  changes: string[];
  isSource?: boolean;
};

export const initialScriptVersions: ScriptVersion[] = [
  {
    id: "v2",
    name: "Версия 2",
    tag: "текущая",
    date: "Сегодня, 10:42 · из диалога",
    text: [
      "Три недели назад я начал бегать по утрам. На третий день мне стало лень, но я всё равно вышел, потому что так уже делал вчера.",
      "Привычка держится не на желании, а на простом первом шаге: надеть кроссовки.",
    ],
    changes: ["Убрал повтор и оставил ваши слова.", "Добавил фразу про первый шаг."],
  },
  {
    id: "v1",
    name: "Версия 1",
    date: "Вчера, 21:15",
    text: [
      "Три недели назад я начал бегать по утрам. На третий день мне стало лень, но я всё равно вышел.",
    ],
    changes: ["Первая сборка из вашего дубля №1."],
  },
  {
    id: "source",
    name: "Основа",
    date: "Дубль №1 · 3 дня назад",
    text: [
      "Три недели назад я начал бегать по утрам. На третий день мне стало лень, но я всё равно вышел, потому что так уже делал вчера.",
    ],
    changes: [],
    isSource: true,
  },
];

/** Mock result of a build: the new version becomes current and older versions lose the "текущая" tag. */
export function withBuiltVersion(versions: ScriptVersion[]): ScriptVersion[] {
  const number = versions.filter((item) => !item.isSource).length + 1;
  const built: ScriptVersion = {
    id: `v${number}`,
    name: `Версия ${number}`,
    tag: "текущая",
    date: "Только что · из диалога",
    text: [
      "Три недели назад я начал бегать по утрам. На третий день мне стало лень, но я всё равно вышел: так уже делал вчера.",
      "Привычка держится не на желании, а на простом первом шаге. Надеть кроссовки — и дальше всё идёт само.",
    ],
    changes: ["Собрал сценарий из ваших ответов в диалоге.", "Сократил заход: сначала событие, потом вывод."],
  };
  return [built, ...versions.map((item) => ({ ...item, tag: undefined }))];
}

/** Script shown in the dialog reader: the newest version, or the source take when there are no versions yet. */
export function readingScript(versions: ScriptVersion[] = initialScriptVersions) {
  const version = versions.find((item) => !item.isSource);
  if (version) return { caption: `Сценарий · ${version.name}`, text: version.text };
  const source = versions.find((item) => item.isSource) ?? initialScriptVersions[initialScriptVersions.length - 1];
  return { caption: "Основа · ваш дубль №1", text: source.text };
}

export function ScriptDesktop({
  versions,
  building,
  onBuild,
  onCancelBuild,
  onHelp,
}: {
  versions: ScriptVersion[];
  building: boolean;
  onBuild: () => void;
  onCancelBuild: () => void;
  onHelp: () => void;
}) {
  const [selectedId, setSelectedId] = useState(versions[0].id);
  const [texts, setTexts] = useState<Record<string, string>>({});
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [finalId, setFinalId] = useState<string | null>(null);
  const [hintOpen, setHintOpen] = useState(true);
  const newestId = versions[0].id;
  // A freshly built version becomes current and is selected right away.
  useEffect(() => { setSelectedId(newestId); setEditing(false); }, [newestId]);
  const version = versions.find((item) => item.id === selectedId) ?? versions[0];
  const textOf = (item: ScriptVersion) => texts[item.id] ?? item.text.join("\n\n");
  const select = (id: string) => { setSelectedId(id); setEditing(false); };
  return (
    <section className="dk-script-page">
      <aside className="dk-versions" aria-label="Версии сценария">
        <button className="dk-btn dk-btn-primary dk-build" disabled={building} aria-busy={building} onClick={onBuild}>
          <Sparkles /> Собрать новую версию
        </button>
        <h2>Версии</h2>
        <ul>
          {versions.map((item) => (
            <li key={item.id}>
              <button
                className={`dk-version ${item.id === selectedId ? "selected" : ""}`}
                aria-current={item.id === selectedId ? "true" : undefined}
                onClick={() => select(item.id)}
              >
                <span className="dk-version-name">
                  {item.name}
                  {item.tag && <em>{item.tag}</em>}
                  {finalId === item.id && <b>Итоговый</b>}
                </span>
                <span className="dk-version-date">{item.date}</span>
              </button>
            </li>
          ))}
        </ul>
      </aside>
      <article className="dk-reader" aria-label={version.name} aria-busy={building}>
        <header>
          <div>
            <span className="dk-eyebrow">{version.name}{version.tag ? ` · ${version.tag}` : ""}</span>
            <h2>Сценарий</h2>
          </div>
          <div className="dk-reader-actions">
            <button
              className="dk-btn dk-btn-secondary"
              disabled={version.isSource || editing || building}
              title={version.isSource ? "Основа — расшифровка вашего дубля" : undefined}
              onClick={() => { setDraft(textOf(version)); setEditing(true); }}
            >
              <Pencil /> Редактировать
            </button>
            <button className="dk-btn dk-btn-ghost" onClick={onHelp}><Sparkles /> Помочь со сценарием</button>
            <button
              className="dk-btn dk-btn-primary"
              disabled={version.isSource || finalId === version.id || building}
              onClick={() => setFinalId(version.id)}
            >
              {finalId === version.id ? <><Check /> Итоговый</> : "Сделать итоговым"}
            </button>
          </div>
        </header>
        {hintOpen && !building && versions.length <= 3 && (
          <div className="dk-hint" role="note">
            <p><strong>Vocal</strong> Я понял так: привычка держится на простом первом шаге, а не на желании. Собрать новую версию?</p>
            <button className="dk-btn dk-btn-primary" onClick={onBuild}><Sparkles /> Собрать новую версию</button>
            <button className="dk-hint-close" aria-label="Закрыть подсказку" onClick={() => setHintOpen(false)}><X /></button>
          </div>
        )}
        {building ? (
          <div className="dk-building"><ScriptBuildingState onCancel={onCancelBuild} /></div>
        ) : editing ? (
          <div className="dk-editor">
            <textarea aria-label="Текст сценария" value={draft} onChange={(event) => setDraft(event.target.value)} autoFocus />
            <div>
              <button className="dk-btn dk-btn-ghost" onClick={() => setEditing(false)}>Отмена</button>
              <button
                className="dk-btn dk-btn-primary"
                disabled={!draft.trim()}
                onClick={() => { setTexts((previous) => ({ ...previous, [version.id]: draft.trim() })); setEditing(false); }}
              >
                Сохранить
              </button>
            </div>
          </div>
        ) : (
          <div className="dk-reader-text">
            {textOf(version).split("\n\n").map((paragraph, index) => <p key={index}>{paragraph}</p>)}
          </div>
        )}
        {!building && version.changes.length > 0 && (
          <details className="dk-changes" key={version.id}>
            <summary>Что изменено <ChevronDown /></summary>
            <ul>
              {version.changes.map((change) => <li key={change}><Check /> {change}</li>)}
            </ul>
          </details>
        )}
      </article>
    </section>
  );
}

const portrait = [
  "Артём Лесной снимает короткие видео о привычках и о людях, которые их меняют. Начинал с заметок в телефоне: записывал фразы, которые слышал в метро, на кухнях друзей, в разговорах после работы, и однажды понял, что из них складывается его главная тема.",
  "Он пришёл в блог из продуктовой команды, где годами объяснял сложное простыми словами. Там же понял, что люди запоминают не советы, а честные истории: как стало лень на третий день и что помогло всё равно выйти из дома.",
  "Артёма интересуют маленькие первые шаги, а не громкие решения: надеть кроссовки, открыть документ, написать одно предложение. Он не продаёт методики и не обещает быстрых результатов, поэтому его видео звучат как разговор, а не как лекция.",
  "Сейчас он собирает серию о том, почему привычка остаётся, когда мотивация исчезла, и ищет в каждой истории одну ясную мысль, которую можно сказать вслух за минуту.",
];

export function ProfilePage({ onBack }: { onBack: () => void }) {
  const [addOpen, setAddOpen] = useState(false);
  const [answer, setAnswer] = useState("");
  const [saved, setSaved] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  useEffect(() => {
    if (!addOpen && !deleteOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setAddOpen(false);
      setDeleteOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [addOpen, deleteOpen]);
  return (
    <main className="dk-profile">
      <header className="dk-profile-bar">
        <button className="dk-back" onClick={onBack}><ArrowLeft /> Мысли</button>
        <span>Профиль</span>
      </header>
      <div className="dk-profile-grid">
        <article className="dk-portrait">
          <div className="dk-portrait-head">
            <div className="dk-avatar" aria-hidden="true">А</div>
            <div>
              <h1>Артём Лесной</h1>
              <p>Автор · видео о привычках и людях</p>
            </div>
          </div>
          <div className="dk-bio">
            {portrait.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
          </div>
          <footer>
            <p>{saved ? "Ответ сохранён. Портрет обновится в ближайшее время." : "Портрет пишется как биография со стороны. Дополнения — через короткий диалог с Vocal."}</p>
            <button className="dk-btn dk-btn-primary" onClick={() => { setSaved(false); setAddOpen(true); }}>Дополнить о себе</button>
          </footer>
        </article>
        <aside className="dk-profile-side">
          <section className="dk-quota" aria-label="Квота">
            <strong>Осталось 100 из 100 мыслей</strong>
            <span role="progressbar" aria-label="Использование мыслей" aria-valuemin={0} aria-valuemax={100} aria-valuenow={100}><i /></span>
            <div>
              <small>Период до 12.11</small>
              <button className="dk-btn dk-btn-secondary">Продлить</button>
            </div>
          </section>
          <div className="dk-rows">
            <button><Settings /> Настройки</button>
            <button><LogOut /> Выйти</button>
            <button className="danger" onClick={() => setDeleteOpen(true)}><Trash2 /> Удалить аккаунт</button>
          </div>
        </aside>
      </div>
      {addOpen && (
        <div className="dk-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setAddOpen(false); }}>
          <section className="dk-modal" role="dialog" aria-modal="true" aria-labelledby="dk-add-title">
            <h2 id="dk-add-title">Дополнить о себе</h2>
            <label htmlFor="dk-answer">Что в вашей жизни за последний год изменило ваш взгляд на привычки?</label>
            <textarea id="dk-answer" value={answer} onChange={(event) => setAnswer(event.target.value)} placeholder="Расскажите своими словами" autoFocus />
            <div>
              <button className="dk-btn dk-btn-ghost" onClick={() => setAddOpen(false)}>Отмена</button>
              <button
                className="dk-btn dk-btn-primary"
                disabled={!answer.trim()}
                onClick={() => { setSaved(true); setAnswer(""); setAddOpen(false); }}
              >
                Сохранить
              </button>
            </div>
          </section>
        </div>
      )}
      {deleteOpen && (
        <div className="dk-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setDeleteOpen(false); }}>
          <section className="dk-modal dk-modal-small" role="alertdialog" aria-modal="true" aria-labelledby="dk-delete-title">
            <h2 id="dk-delete-title">Удалить аккаунт?</h2>
            <p>Мысли, дубли и сценарии будут удалены без возможности восстановить.</p>
            <div>
              <button className="dk-btn dk-btn-ghost" onClick={() => setDeleteOpen(false)} autoFocus>Отмена</button>
              <button className="dk-btn dk-btn-danger" onClick={() => setDeleteOpen(false)}>Удалить</button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
