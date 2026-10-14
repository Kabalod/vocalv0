import { Inter, Literata } from 'next/font/google'
import { BigNumberSlide, CoverSlide, CtaSlide, ListSlide, QuoteSlide, StatementSlide, StepsSlide, themes, type SlideTheme } from '@/components/instagram-slides'

const inter = Inter({ subsets: ['latin', 'cyrillic'], weight: ['400', '600', '700', '800'] })
const literata = Literata({ subsets: ['latin', 'cyrillic'], weight: ['500', '700'] })
const galleryThemes = Object.fromEntries(Object.entries(themes).map(([name, theme]) => [name, { ...theme, headingFont: theme.headingFont === 'Literata' ? literata.style.fontFamily : inter.style.fontFamily, bodyFont: inter.style.fontFamily }])) as Record<string, SlideTheme>
const themeEntries = Object.entries(galleryThemes)

const samples = [
  { name: 'cover', render: (theme: SlideTheme) => <CoverSlide theme={theme} index={1} kicker="3 ошибки" title="Почему вы бросаете спорт к середине февраля" /> },
  { name: 'statement', render: (theme: SlideTheme) => <StatementSlide theme={theme} index={2} title="Дело не в силе воли" body="В январе мы берём план на человека, которым только хотим стать. Через месяц он заканчивается" /> },
  { name: 'list', render: (theme: SlideTheme) => <ListSlide theme={theme} index={3} title="Что ломает привычку" items={['Слишком длинные тренировки', 'Цель на результат, а не на действие', 'Пропуск = провал']} /> },
  { name: 'big-number', render: (theme: SlideTheme) => <BigNumberSlide theme={theme} index={4} value="15 минут" title="Хватит, чтобы не выпасть из ритма в плохой день" /> },
  { name: 'steps', render: (theme: SlideTheme) => <StepsSlide theme={theme} index={5} title="Как перезапуститься" items={['Сократите план вдвое', 'Отмечайте факт, а не вес', 'После пропуска — сразу следующая']} /> },
  { name: 'quote', render: (theme: SlideTheme) => <QuoteSlide theme={theme} index={6} body="Я перестала ждать понедельника — тренируюсь в тот день, когда вспомнила" handle="@anna.move" /> },
  { name: 'cta', render: (theme: SlideTheme) => <CtaSlide theme={theme} index={7} title="Сохраните, чтобы вернуться в марте" body="И напишите в директ слово СТАРТ — пришлю план на 15 минут" handle="@anna.move" /> },
]

export default function CarouselGalleryPage() {
  return <main style={{ minHeight: '100vh', padding: '48px', color: '#f4f2f7', background: '#0d0d0f', fontFamily: 'Inter, sans-serif' }}>
    <header style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 40 }}><span style={{ color: '#a28bfb', fontSize: 14, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase' }}>Vocal · Instagram</span><h1 style={{ margin: 0, fontSize: 38, lineHeight: 1.1 }}>Компоненты карусели</h1><p style={{ margin: 0, color: '#94919d', fontSize: 16 }}>7 макетов × 3 темы · исходный артборд 1080 × 1350 px · масштаб 25%</p></header>
    <section aria-label="Галерея слайдов" style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
      {samples.map((sample) => <section key={sample.name} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}><h2 style={{ margin: 0, color: '#d3d0da', fontSize: 16, fontWeight: 600 }}>{sample.name}</h2><div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>{themeEntries.map(([themeName, theme]) => <figure key={themeName} style={{ display: 'flex', flexDirection: 'column', width: 270, margin: 0, gap: 10 }}><div style={{ width: 270, height: 338, overflow: 'hidden', borderRadius: 6, boxShadow: '0 16px 50px rgba(0,0,0,.3)' }}><div style={{ display: 'flex', width: 1080, height: 1350, transform: 'scale(0.25)', transformOrigin: 'top left' }}>{sample.render(theme)}</div></div><figcaption style={{ color: '#77737e', fontSize: 13 }}>{themeName}</figcaption></figure>)}</div></section>)}
    </section>
  </main>
}
