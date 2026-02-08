import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'FAQ',
  description: 'Frequently asked questions about Acestars Tennis Coaching. Booking, payment, coaching programmes, venues, and holiday camps.',
}

export default function FAQLayout({ children }: { children: React.ReactNode }) {
  return children
}
