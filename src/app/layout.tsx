import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
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
        {/* Google tag (gtag.js) — GA4. Makes window.gtag/dataLayer real so track() events land in GA4. */}
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-NJKNDWT03G" strategy="afterInteractive" />
        <Script
          id="ga4-gtag"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-NJKNDWT03G');
            `,
          }}
        />
        <Script
          id="facebook-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '1479262856938057');
              fbq('track', 'PageView');
            `,
          }}
        />
        <noscript>
          <img
            height="1"
            width="1"
            src="https://www.facebook.com/tr?id=1479262856938057&ev=PageView&noscript=1"
          />
        </noscript>
      </body>
    </html>
  )
}
