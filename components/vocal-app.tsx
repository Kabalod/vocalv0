'use client'

import { useState } from 'react'
import { ArrowLeft, ArrowRight, AudioWaveform, Check, Copy, Download, Mic, MoreHorizontal, Sparkles, Trash2 } from 'lucide-react'

const tabs = ['Дубли', 'Диалог', 'Сценарий'] as const
type Tab = (typeof tabs)[number]

type VoiceMessage = { role: 'vocal' | 'author'; text: string; note?: string }

const messages: VoiceMessage[] = [
  { role: 'vocal', text: 'Почему привычка остаётся, когда мотивация исчезла?' },
  { role: 'author', text: 'На третий день мне стало лень, но я всё равно вышел, потому что так уже делал вчера.' },
  { role: 'vocal', note: 'Чем подробнее вы рассказываете, тем лучше получится сценарий для рилс.', text: 'Что вы почувствовали, когда всё-таки вышли на пробежку?' },
  { role: 'author', text: 'Стало легче дышать. Дальше пошло само.' },
]

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand">Vocal</div>
      <a className="nav-link nav-link-active" href="#dialog" aria-label="Мысли">✦<span>Мысли</span></a>
      <div className="sidebar-bottom">
        <a className="profile-link" href="#profile" aria-label="Профиль">◌<span>Профиль</span></a>
        <button className="collapse-button" type="button" aria-label="Свернуть меню">←</button>
      </div>
    </aside>
  )
}

function WorkspaceHeader({ tab, onTabChange }: { tab: Tab; onTabChange: (tab: Tab) => void }) {
  return (
    <header className="workspace-header">
      <div className="back-link">← <span>Мысли</span></div>
      <div className="title-row">
        <h1>Привычка и мотивация</h1>
        <span className="status">Не завершена</span>
        <button className="delete-link" type="button"><Trash2 aria-hidden="true" /> Удалить мысль</button>
      </div>
      <nav className="tabs" aria-label="Раздел мысли">
        {tabs.map((item) => (
          <button key={item} className={tab === item ? 'tab tab-active' : 'tab'} onClick={() => onTabChange(item)} type="button" aria-current={tab === item ? 'page' : undefined}>{item}</button>
        ))}
      </nav>
    </header>
  )
}

function Dialog({ direction }: { direction: Direction }) {
  const [draft, setDraft] = useState('')
  const isRecorder = direction === 'recorder'
  const isNotebook = direction === 'notebook'
  return (
    <section className={`dialog-view dialog-${direction}`} id="dialog" aria-label="Диалог с Vocal">
      <div className="conversation" aria-live="polite">
        {messages.map((message, index) => (
          <article key={index} className={message.role === 'author' ? 'message message-author' : 'message message-vocal'}>
            {message.role === 'vocal' && <div className="message-label">Vocal</div>}
            {message.note && <p className="message-note">{message.note}</p>}
            <p>{message.text}</p>
          </article>
        ))}
      </div>
      {isRecorder ? (
        <div className="recorder-compose">
          <button className="button button-outline record-top" type="button">Записать дубль</button>
          <div className="record-wave"><AudioWaveform aria-hidden="true" /><button className="record-button" type="button" aria-label="Начать запись"><Mic aria-hidden="true" /></button><AudioWaveform aria-hidden="true" /></div>
          <form className="recorder-input" onSubmit={(event) => { event.preventDefault(); setDraft('') }}><input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="или напишите ответ" aria-label="Или напишите ответ" /><button type="submit" aria-label="Отправить ответ"><ArrowRight aria-hidden="true" /></button></form>
        </div>
      ) : (
        <form className="composer" onSubmit={(event) => { event.preventDefault(); setDraft('') }}>
          <label className="sr-only" htmlFor="reply">Напишите ответ</label>
          <textarea id="reply" value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Напишите ответ..." rows={2} />
          <div className="composer-actions"><div className="composer-tools"><button className="button button-outline" type="button">Записать дубль</button><button className="icon-button" type="button" aria-label="Записать голосовое сообщение"><Mic aria-hidden="true" /></button></div><button className="button button-primary" type="submit">Отправить <ArrowRight aria-hidden="true" /></button></div>
        </form>
      )}
    </section>
  )
}

function ScriptView() {
  return (
    <section className="script-view" aria-label="Сценарий">
      <article className="source-card">
        <p className="eyebrow">Основа: ваш дубль №1, как он записан</p>
        <p>Три недели назад я начал бегать по утрам. На третий день мне стало лень, но я всё равно вышел, потому что так уже делал вчера.</p>
      </article>
      <article className="vocal-prompt">
        <div><div className="message-label">Vocal</div><p>Я понял так: привычка держится на простом первом шаге, а не на желании. Собрать сценарий?</p></div>
        <button className="button button-primary" type="button"><Sparkles aria-hidden="true" /> Сгенерировать сценарий</button>
      </article>
      <div className="version-heading"><h2>Версия 2</h2><div className="version-control"><button className="icon-button" type="button" aria-label="Предыдущая версия"><ArrowLeft aria-hidden="true" /></button><span>2 из 2</span><button className="icon-button" type="button" aria-label="Следующая версия" disabled><ArrowRight aria-hidden="true" /></button></div></div>
      <article className="script-card">
        <p className="eyebrow">Создана с Vocal · опора для следующего дубля</p>
        <p className="script-text">Три недели назад я начал бегать по утрам. На третий день мне стало лень, но я всё равно вышел, потому что так уже делал вчера. Привычка держится не на желании, а на простом первом шаге: надеть кроссовки.</p>
        <div className="change-note"><strong>Что изменено и почему</strong><ul><li>Убрал повтор и оставил ваши слова.</li><li>Добавил последнюю фразу про первый шаг: вы сказали её в диалоге.</li></ul></div>
        <div className="action-row"><button className="button button-outline" type="button">Редактировать</button><button className="button button-outline" type="button"><Copy aria-hidden="true" /> Копировать</button><button className="button button-outline" type="button"><Download aria-hidden="true" /> Скачать .txt</button><button className="button button-primary" type="button"><Check aria-hidden="true" /> Сделать итоговой</button></div>
      </article>
      <div className="disabled-hint"><button className="button button-outline" type="button" disabled>Копировать</button><span>так выглядят недоступные действия, пока версия не готова</span></div>
    </section>
  )
}

function ReplyStates() {
  const states = [
    ['1. Два коротких ответа подряд (один раз за мысль)', 'Чем подробнее вы рассказываете, тем лучше получится сценарий для рилс.', 'Что вы почувствовали, когда всё-таки вышли на пробежку?'],
    ['2. Два ответа подряд без новых сведений', '', 'Пока ответы не добавляют материала, сценарий лучше не станет. Расскажите один случай, запишите ещё дубль или закончим на этом.'],
    ['3. «Хочу закончить», материала мало', '', 'Закончим на этом? Из того, что есть, новый сценарий не получится. Ваш дубль сохранён как основа, к мысли можно вернуться в любой момент.'],
    ['4. Материала достаточно', '', 'Я понял так: привычка держится на простом первом шаге, а не на желании. Собрать сценарий?'],
    ['5. Сообщение не по теме мысли', '', 'Это в сторону от нашей мысли, давайте вернёмся к ней. Расскажите в деталях, какой случай про привычку ярко вспоминается?'],
    ['6. Кнопка «Сгенерировать сценарий», материала нет', '', 'Для нового сценария пока мало ваших слов. Основа сохранена. Расскажите один случай или запишите ещё дубль, и я соберу.'],
  ]
  return <section className="states-view" aria-label="Состояния реплик Vocal"><div className="states-heading"><div><p className="eyebrow">Референс реплик</p><h2>Реплики Vocal по состояниям</h2></div><button className="icon-button" type="button" aria-label="Дополнительные действия"><MoreHorizontal aria-hidden="true" /></button></div><p className="states-intro">Что автор видит в диалоге в каждом случае. Список ответов не показывается и не редактируется: автор только разговаривает с сервисом.</p><div className="states-grid">{states.map(([title, note, text]) => <article className="state-card" key={title}><p className="state-title">{title}</p><div className="state-bubble"><div className="message-label">Vocal</div>{note && <p className="message-note">{note}</p>}<p>{text}</p>{title.startsWith('6.') && <div className="state-actions"><button className="button button-primary" type="button">Сгенерировать сценарий</button><button className="button button-outline" type="button">Записать дубль</button></div>}</div></article>)}</div></section>
}

type Direction = 'sufler' | 'notebook' | 'recorder'

export default function VocalApp() {
  const [tab, setTab] = useState<Tab>('Диалог')
  const [direction, setDirection] = useState<Direction>('sufler')
  return <div className={`vocal-shell theme-${direction}`}><Sidebar /><main className="app-main"><WorkspaceHeader tab={tab} onTabChange={setTab} />{tab === 'Диалог' && <div className="direction-switch" aria-label="Направление диалога"><span>Направление</span><button className={direction === 'sufler' ? 'direction-active' : ''} onClick={() => setDirection('sufler')} type="button">A · Суфлёр</button><button className={direction === 'notebook' ? 'direction-active' : ''} onClick={() => setDirection('notebook')} type="button">B · Блокнот</button><button className={direction === 'recorder' ? 'direction-active' : ''} onClick={() => setDirection('recorder')} type="button">C · Диктофон</button></div>}{tab === 'Диалог' && <Dialog direction={direction} />}{tab === 'Сценарий' && <ScriptView />}{tab === 'Дубли' && <ReplyStates />}</main></div>
}

export { Dialog, ScriptView, ReplyStates }
