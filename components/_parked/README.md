# Отложено до отзывов тестеров

Код ниже убран из сборки и из навигации. Календарь (`components/calendar/`) его не использует.

| Файл | Что это | Откуда |
|---|---|---|
| `vault-shoot-desktop.tsx` | «Копилка», «Съёмочный день», режим съёмки, инспектор момента (десктоп) | бывший `planning-desktop.tsx` |
| `vault-shoot-mobile.tsx` | то же для телефона | бывший `planning-mobile.tsx` |
| `vault-shoot-content-calendar.tsx` | то же в третьем варианте календаря | бывший `content-calendar.tsx` |
| `events-diary.tsx` | дневник событий (в сборку не был подключён) | как был |
| `*.css` | стили этих экранов целиком | бывшие `planning-*.css`, `content-calendar.css` |

Папка исключена из `tsconfig.json`. Чтобы вернуть экран, переносим код в `components/`, чиним импорты и подключаем к календарю.
Полные версии трёх старых календарей: `git show a28bde4:components/planning-desktop.tsx` (и остальные).
