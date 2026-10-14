import { Inter, Literata } from 'next/font/google'
import { ListSlide, themes, type SlideTheme } from '@/components/instagram-slides'

const inter = Inter({ subsets: ['latin', 'cyrillic'], weight: ['400', '600', '700', '800'] })
const literata = Literata({ subsets: ['latin', 'cyrillic'], weight: ['500', '700'] })
const testThemes = Object.fromEntries(Object.entries(themes).map(([name, theme]) => [name, { ...theme, headingFont: theme.headingFont === 'Literata' ? literata.style.fontFamily : inter.style.fontFamily, bodyFont: inter.style.fontFamily }])) as Record<string, SlideTheme>

const longTitle = 'Самоорганизация помогает сохранять устойчивый ритм предпринимательства'
const longItems = [
  'Самоорганизация начинается с одного реалистичного действия каждый день',
  'Предпринимательство требует ритма, который выдерживает сложные недели',
  'Отмечайте выполненное действие, даже если результат пока незаметен',
  'После пропуска возвращайтесь к следующему шагу без чувства провала',
]

export default function CarouselStressPage() {
  return <main style={{ display: 'flex', flexWrap: 'wrap', gap: 24, minHeight: '100vh', padding: 32, backgroundColor: '#09090b' }}>
    {Object.entries(testThemes).map(([name, theme]) => <figure key={name} style={{ display: 'flex', flexDirection: 'column', width: 540, margin: 0, gap: 10 }}><div style={{ display: 'flex', width: 540, height: 675, overflow: 'hidden' }}><div style={{ display: 'flex', width: 1080, height: 1350, transform: 'scale(0.5)', transformOrigin: 'top left' }}><ListSlide theme={theme} index={3} kicker="Проверка текста" title={longTitle} items={longItems} /></div></div><figcaption style={{ color: '#94919d', fontFamily: 'Inter', fontSize: 16 }}>{name}</figcaption></figure>)}
  </main>
}
