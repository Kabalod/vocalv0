'use client'

import { useState } from 'react'
import { ArrowLeft, ArrowRight, Check, Copy, Download, Mic, MoreHorizontal, Play, Sparkles, Trash2 } from 'lucide-react'

const tabs = ['Дубли', 'Диалог', 'Сценарий'] as const
type Tab = (typeof tabs)[number]

const messages = [
  { role: 'vocal', text: 'Почему привычка остаётся, когда мотивация исчезла?' },
  { role: 'author', text: 'На третий день мне стало лень, но я всё равно вышел, потому что так уже делал вчера.' },
  { role: 'vocal', note: 'Чем подробнее вы рассказываете, тем лучше получится сценарий для рилс.', text: 'Что вы почувствовали, когда всё-таки вышли на пробежку?' },
  { role: 'author', text: 'Стало легче дышать. Дальше пошло само.' },
]

function Sidebar() {
  return <aside className="sidebar"><div className="brand">Vocal</div><div className="sidebar-caption">МЫСЛИ</div><nav className="thought-list"><a className="thought active" href="#dialog"><span>Привычка и мотивация</span><small>Не завершена</small></a><a className="thought" href="#idea"><span>Переезд в другой город</span><small>Не начата</small></a><a className="thought" href="#content"><span>Как не выгорать</span><small>Не завершена</small></a></nav><div className="sidebar-bottom"><a href="#profile">Профиль</a><button className="icon-button" type="button" aria-label="Свернуть боковую панель"><ArrowLeft /></button></div></aside>
}

function WorkspaceHeader({ tab, onTabChange }: { tab: Tab; onTabChange: (tab: Tab) => void }) {
  return <header className="workspace-header"><div className="back-link"><ArrowLeft aria-hidden="true" /> Мысли</div><div className="title-row"><h1>Привычка и мотивация</h1><span className="status">Не завершена</span><button className="more-button" type="button" aria-label="Меню мысли"><MoreHorizontal /></button></div><nav className="tabs" aria-label="Раздел мысли">{tabs.map((item) => <button key={item} className={tab === item ? 'tab tab-active' : 'tab'} onClick={() => onTabChange(item)} type="button" aria-current={tab === item ? 'page' : undefined}>{item}</button>)}</nav></header>
}

function Dialog() {
  const [draft, setDraft] = useState('')
  return <section className="dialog-view" id="dialog" aria-label="Диалог с Vocal"><div className="conversation" aria-live="polite">{messages.map((message, index) => <article key={index} className={`message message-${message.role}`}>{message.role === 'vocal' && <div className="message-label">Vocal</div>}{message.note && <p className="message-note">{message.note}</p>}<p>{message.text}</p></article>)}</div><form className="composer" onSubmit={(event) => { event.preventDefault(); setDraft('') }}><label className="sr-only" htmlFor="reply">Напишите ответ</label><textarea id="reply" value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Напишите ответ..." rows={2} /><div className="composer-actions"><button className="button button-outline" type="button"><Mic aria-hidden="true" /> Записать дубль</button><button className="button button-primary" type="submit">Отправить <ArrowRight aria-hidden="true" /></button></div></form></section>
}

function ScriptView() {
  return <section className="script-layout" aria-label="Сценарий"><div className="script-main"><article className="source-card"><p className="eyebrow">Основа · ваш дубль №1</p><p>Три недели назад я начал бегать по утрам. На третий день мне стало лень, но я всё равно вышел, потому что так уже делал вчера.</p></article><div className="vocal-prompt"><div><div className="message-label">Vocal</div><p>Я понял так: привычка держится на простом первом шаге, а не на желании. Собрать сценарий?</p></div><button className="button button-primary" type="button"><Sparkles aria-hidden="true" /> Сгенерировать сценарий</button></div><div className="version-heading"><h2>Версия 2 из 2</h2><div className="version-control"><button className="icon-button" type="button" aria-label="Предыдущая версия"><ArrowLeft /></button><button className="icon-button" type="button" aria-label="Следующая версия" disabled><ArrowRight /></button></div></div><article className="script-card"><p className="eyebrow">Создана с Vocal · опора для следующего дубля</p><p className="script-text">Три недели назад я начал бегать по утрам. На третий день мне стало лень, но я всё равно вышел, потому что так уже делал вчера. Привычка держится не на желании, а на простом первом шаге: надеть кроссовки.</p><div className="change-note"><strong>Что изменено и почему</strong><ul><li>Убрал повтор и оставил ваши слова.</li><li>Добавил последнюю фразу про первый шаг.</li></ul></div></article></div><aside className="version-inspector"><div className="inspector-title"><span>Версия</span><MoreHorizontal /></div><div className="inspector-toggle"><button className="active" type="button">Изменения</button><button type="button">Основа</button></div><div className="inspector-copy"><p>Вторая версия собрана из ваших слов и уточнений в диалоге.</p><div className="inspector-item"><Check /> Сохранён ваш голос</div><div className="inspector-item"><Check /> Добавлен первый шаг</div></div><div className="inspector-actions"><button className="button button-outline" type="button">Править</button><button className="button button-outline" type="button"><Copy /> Копировать</button><button className="button button-outline" type="button"><Download /> Скачать</button><button className="button button-primary" type="button">Сделать итоговой</button></div></aside></section>
}

function DraftsView() { return <section className="drafts-view"><div className="empty-icon"><Play /></div><h2>Дубли</h2><p>Здесь появятся ваши голосовые дубли.</p><button className="button button-primary" type="button"><Mic /> Записать дубль</button></section> }

export default function VocalApp() { const [tab, setTab] = useState<Tab>('Диалог'); return <div className="vocal-shell"><Sidebar /><main className="app-main"><WorkspaceHeader tab={tab} onTabChange={setTab} />{tab === 'Диалог' && <Dialog />}{tab === 'Сценарий' && <ScriptView />}{tab === 'Дубли' && <DraftsView />}</main></div> }

export { Dialog, ScriptView, DraftsView }

// lucide-react icons use the shared 1.6px visual weight through CSS.
