import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { ErrorBoundary } from '@/components/ErrorBoundary'

export const metadata: Metadata = {
  title: {
    default: 'Acestars Tennis Coaching – Professional Tennis Lessons in Berkshire, Hampshire & Surrey',
    template: '%s | Acestars Tennis Coaching',
  },
  description: 'For over 10 years, Acestars have been providing high quality professional tennis coaching to communities in Berkshire, Hampshire & Surrey. Book private lessons, group coaching, and holiday camps.',
  keywords: ['tennis coaching', 'tennis lessons', 'Berkshire tennis', 'Hampshire tennis', 'Surrey tennis', 'junior tennis', 'holiday camps', 'Ludgrove School', 'Edgbarrow School', 'Acestars'],
  authors: [{ name: 'Acestars Tennis Coaching' }],
  openGraph: {
    type: 'website',
    locale: 'en_GB',
    url: 'https://www.acestars.co.uk',
    siteName: 'Acestars Tennis Coaching',
    title: 'Acestars Tennis Coaching – Professional Tennis Lessons',
    description: 'High quality professional tennis coaching for all ages in Berkshire, Hampshire & Surrey. Private lessons, group coaching, and holiday camps.',
    images: [{ url: '/images/uploads/2019/03/Depositphotos_115174380_xl-2015-wide-outlined.jpg', width: 1200, height: 630, alt: 'Acestars Tennis Coaching' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Acestars Tennis Coaching',
    description: 'Professional tennis coaching for all ages in Berkshire, Hampshire & Surrey.',
    images: ['/images/uploads/2019/03/Depositphotos_115174380_xl-2015-wide-outlined.jpg'],
  },
  robots: { index: true, follow: true },
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <ErrorBoundary>
          <main>{children}</main>
        </ErrorBoundary>
        <Footer />
      </body>
    </html>
  )
}
