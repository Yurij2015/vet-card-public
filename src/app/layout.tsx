import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '../assets/main.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'VetCard',
  description: 'Your pet’s health, simplified.',
}

export default function RootLayout({
  children,
  lang = 'uk', // fallback to 'uk' if not provided
}: Readonly<{
  children: React.ReactNode
  lang?: string
}>) {
  return (
    <html lang={lang}>
      <body className={inter.className}>{children}</body>
    </html>
  )
}