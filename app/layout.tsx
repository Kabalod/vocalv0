import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Geologica, Golos_Text, Literata, Onest, Spectral } from 'next/font/google'
import './globals.css'

const literata = Literata({ subsets: ['cyrillic'], variable: '--font-literata' })
const golos = Golos_Text({ subsets: ['cyrillic'], variable: '--font-golos' })
const spectral = Spectral({ subsets: ['cyrillic'], weight: ['400', '500', '600'], variable: '--font-spectral' })
const onest = Onest({ subsets: ['cyrillic'], variable: '--font-onest' })
const geologica = Geologica({ subsets: ['cyrillic'], variable: '--font-geologica' })

export const metadata: Metadata = {
  title: 'Vocal — Привычка и мотивация',
  description: 'Камерный инструмент, который помогает развить мысль и собрать разговорный сценарий.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ru">
      <body className={`antialiased ${literata.variable} ${golos.variable} ${spectral.variable} ${onest.variable} ${geologica.variable}`}>
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
