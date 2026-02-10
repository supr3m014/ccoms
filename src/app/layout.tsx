import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Core Conversion Digital Marketing Services - CCOMS',
  description: 'Technical SEO, development, and digital strategy—tailored to your business goals and built to increase rankings, leads, and revenue.',
  keywords: 'SEO, digital marketing, website development, mobile apps, AEO, GEO, brand design, video production',
  icons: {
    icon: '/core-conversion.png',
    apple: '/core-conversion.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} bg-white text-neutral-900 antialiased`}>
        {children}
      </body>
    </html>
  )
}
