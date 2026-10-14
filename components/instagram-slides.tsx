import type { CSSProperties, ReactNode } from 'react'

export type SlideTheme = {
  bg: string
  bg2: string
  text: string
  muted: string
  accent: string
  headingFont: string
  bodyFont: string
}

type SharedProps = { theme: SlideTheme; index: number; handle?: string; kicker?: string }
type FrameProps = SharedProps & { children: ReactNode; cover?: boolean }

export const themes = {
  graphite: { bg: '#131315', bg2: '#1d1d20', text: '#f4f2f7', muted: '#94919d', accent: '#a28bfb', headingFont: 'Inter', bodyFont: 'Inter' },
  paper: { bg: '#f3eee4', bg2: '#ebe4d6', text: '#1a1424', muted: '#6b6474', accent: '#7154d9', headingFont: 'Literata', bodyFont: 'Inter' },
  contrast: { bg: '#ffffff', bg2: '#ffffff', text: '#0b0b0c', muted: '#6b6b70', accent: '#7a5af5', headingFont: 'Inter', bodyFont: 'Inter' },
} satisfies Record<string, SlideTheme>

const titleSize = (text: string, sizes: [number, number, number]) => text.length <= 25 ? sizes[0] : text.length <= 45 ? sizes[1] : sizes[2]
const headingWeight = (theme: SlideTheme) => theme.headingFont === 'Literata' ? 700 : theme.bg === '#ffffff' ? 800 : 700
const wrap: CSSProperties = { overflowWrap: 'anywhere', wordBreak: 'normal', hyphens: 'auto' }
const contentStyle: CSSProperties = { display: 'flex', flexDirection: 'column', width: '100%', height: '100%', justifyContent: 'center' }

function Kicker({ children, theme }: { children?: string; theme: SlideTheme }) {
  if (!children) return null
  return <div style={{ display: 'flex', color: theme.accent, fontFamily: theme.bodyFont, fontSize: 30, lineHeight: 1.25, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 34 }}>{children}</div>
}

export function SlideFrame({ theme, index, handle = '@anna.move', cover = false, children }: FrameProps) {
  return <div lang="ru" style={{ display: 'flex', flexDirection: 'column', position: 'relative', width: 1080, height: 1350, flexShrink: 0, overflow: 'hidden', padding: 96, color: theme.text, backgroundColor: theme.bg, backgroundImage: `linear-gradient(180deg, ${theme.bg} 0%, ${theme.bg2} 100%)`, fontFamily: theme.bodyFont }}>
    <div style={{ display: 'flex', position: 'absolute', top: 72, right: 96, color: theme.muted, fontFamily: theme.bodyFont, fontSize: 28, lineHeight: 1, fontWeight: 400 }}>{index}/7</div>
    {children}
    <div style={{ display: 'flex', position: 'absolute', left: 96, bottom: 72, color: theme.muted, fontFamily: theme.bodyFont, fontSize: 28, lineHeight: 1, fontWeight: 400 }}>{handle}</div>
    {cover ? <div style={{ display: 'flex', alignSelf: 'flex-end', marginTop: 'auto', color: theme.muted, fontFamily: theme.bodyFont, fontSize: 28, lineHeight: 1 }}>листай →</div> : null}
  </div>
}

export function CoverSlide({ theme, index = 1, handle, kicker, title }: SharedProps & { title: string }) {
  return <SlideFrame theme={theme} index={index} handle={handle} cover><div style={contentStyle}><Kicker theme={theme}>{kicker}</Kicker><div style={{ display: 'flex', maxWidth: 888, color: theme.text, fontFamily: theme.headingFont, fontSize: titleSize(title, [108, 92, 78]), lineHeight: .98, letterSpacing: -3.2, fontWeight: headingWeight(theme), ...wrap }}>{title}</div></div></SlideFrame>
}

export function StatementSlide({ theme, index, handle, kicker, title, body }: SharedProps & { title: string; body?: string }) {
  return <SlideFrame theme={theme} index={index} handle={handle}><div style={contentStyle}><Kicker theme={theme}>{kicker}</Kicker><div style={{ display: 'flex', color: theme.text, fontFamily: theme.headingFont, fontSize: titleSize(title, [104, 88, 72]), lineHeight: 1.02, letterSpacing: -2.5, fontWeight: headingWeight(theme), ...wrap }}>{title}</div>{body ? <div style={{ display: 'flex', marginTop: 50, maxWidth: 830, color: theme.muted, fontFamily: theme.bodyFont, fontSize: 38, lineHeight: 1.38, fontWeight: 400, ...wrap }}>{body}</div> : null}</div></SlideFrame>
}

export function ListSlide({ theme, index, handle, kicker, title, items }: SharedProps & { title: string; items: string[] }) {
  return <SlideFrame theme={theme} index={index} handle={handle}><div style={contentStyle}><Kicker theme={theme}>{kicker}</Kicker><div style={{ display: 'flex', color: theme.text, fontFamily: theme.headingFont, fontSize: titleSize(title, [82, 72, 62]), lineHeight: 1.04, letterSpacing: -1.8, fontWeight: headingWeight(theme), ...wrap }}>{title}</div><div style={{ display: 'flex', flexDirection: 'column', marginTop: 58, gap: items.length === 4 ? 26 : 36 }}>{items.slice(0, 4).map((item) => <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 24 }}><div style={{ display: 'flex', width: 14, height: 14, flexShrink: 0, marginTop: 17, borderRadius: 999, backgroundColor: theme.accent }} /><div style={{ display: 'flex', color: theme.text, fontFamily: theme.bodyFont, fontSize: items.length === 4 ? 34 : 40, lineHeight: 1.24, fontWeight: 600, ...wrap }}>{item}</div></div>)}</div></div></SlideFrame>
}

export function StepsSlide({ theme, index, handle, kicker, title, items }: SharedProps & { title: string; items: string[] }) {
  return <SlideFrame theme={theme} index={index} handle={handle}><div style={contentStyle}><Kicker theme={theme}>{kicker}</Kicker><div style={{ display: 'flex', color: theme.text, fontFamily: theme.headingFont, fontSize: titleSize(title, [80, 70, 60]), lineHeight: 1.04, letterSpacing: -1.7, fontWeight: headingWeight(theme), ...wrap }}>{title}</div><div style={{ display: 'flex', flexDirection: 'column', marginTop: 54, gap: items.length === 4 ? 24 : 34 }}>{items.slice(0, 4).map((item, itemIndex) => <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 24 }}><div style={{ display: 'flex', width: 66, flexShrink: 0, color: theme.accent, fontFamily: 'Inter', fontSize: 28, lineHeight: 1.45, fontWeight: 700 }}>{String(itemIndex + 1).padStart(2, '0')}</div><div style={{ display: 'flex', color: theme.text, fontFamily: theme.bodyFont, fontSize: items.length === 4 ? 33 : 39, lineHeight: 1.25, fontWeight: 600, ...wrap }}>{item}</div></div>)}</div></div></SlideFrame>
}

export function QuoteSlide({ theme, index, handle, body }: Omit<SharedProps, 'kicker'> & { body: string }) {
  return <SlideFrame theme={theme} index={index} handle={handle}><div style={contentStyle}><div style={{ display: 'flex', color: theme.accent, fontFamily: 'Literata', fontSize: 160, lineHeight: .55, fontWeight: 700 }}>“</div><div style={{ display: 'flex', marginTop: 36, color: theme.text, fontFamily: 'Literata', fontSize: titleSize(body, [70, 62, 54]), lineHeight: 1.18, letterSpacing: -1.3, fontWeight: 500, ...wrap }}>{body}</div><div style={{ display: 'flex', marginTop: 52, color: theme.accent, fontFamily: theme.bodyFont, fontSize: 32, lineHeight: 1, fontWeight: 700 }}>{handle}</div></div></SlideFrame>
}

export function BigNumberSlide({ theme, index, handle, value, title, body }: Omit<SharedProps, 'kicker'> & { value: string; title: string; body?: string }) {
  return <SlideFrame theme={theme} index={index} handle={handle}><div style={contentStyle}><div style={{ display: 'flex', color: theme.accent, fontFamily: theme.headingFont, fontSize: titleSize(value, [174, 150, 132]), lineHeight: .88, letterSpacing: -5, fontWeight: headingWeight(theme), ...wrap }}>{value}</div><div style={{ display: 'flex', marginTop: 50, color: theme.text, fontFamily: theme.headingFont, fontSize: titleSize(title, [68, 60, 52]), lineHeight: 1.08, letterSpacing: -1.5, fontWeight: headingWeight(theme), ...wrap }}>{title}</div>{body ? <div style={{ display: 'flex', marginTop: 34, color: theme.muted, fontFamily: theme.bodyFont, fontSize: 34, lineHeight: 1.35, ...wrap }}>{body}</div> : null}</div></SlideFrame>
}

export function CtaSlide({ theme, index, handle, title, body }: Omit<SharedProps, 'kicker'> & { title: string; body?: string }) {
  return <SlideFrame theme={theme} index={index} handle={handle}><div style={contentStyle}><div style={{ display: 'flex', color: theme.text, fontFamily: theme.headingFont, fontSize: titleSize(title, [94, 80, 68]), lineHeight: 1.02, letterSpacing: -2.2, fontWeight: headingWeight(theme), ...wrap }}>{title}</div>{body ? <div style={{ display: 'flex', marginTop: 48, color: theme.muted, fontFamily: theme.bodyFont, fontSize: 38, lineHeight: 1.38, ...wrap }}>{body}</div> : null}<div style={{ display: 'flex', alignSelf: 'flex-start', marginTop: 58, padding: '20px 32px', borderRadius: 999, color: theme.bg, backgroundColor: theme.accent, fontFamily: theme.bodyFont, fontSize: 30, lineHeight: 1, fontWeight: 700 }}>Написать СТАРТ</div><div style={{ display: 'flex', marginTop: 36, color: theme.accent, fontFamily: theme.bodyFont, fontSize: 42, lineHeight: 1, fontWeight: 700 }}>{handle}</div></div></SlideFrame>
}
