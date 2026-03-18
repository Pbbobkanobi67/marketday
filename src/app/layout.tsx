import type { Metadata } from 'next'
import { Playfair_Display, DM_Sans, DM_Mono } from 'next/font/google'
import { CartProvider } from '@/context/CartContext'
import { Toaster } from 'sonner'
import './globals.css'
import { MARKET_CONFIG } from '@/config/market.config'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
})

const dmMono = DM_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-dm-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: MARKET_CONFIG.siteTitle,
  description: MARKET_CONFIG.siteDescription,
  keywords: 'farmers market, San Diego, fresh produce, local food, Liberty Station',
  openGraph: {
    title: MARKET_CONFIG.siteTitle,
    description: MARKET_CONFIG.siteDescription,
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${playfair.variable} ${dmSans.variable} ${dmMono.variable} font-sans`}>
        <CartProvider>
          {children}
          <Toaster position="bottom-right" richColors />
        </CartProvider>
      </body>
    </html>
  )
}
